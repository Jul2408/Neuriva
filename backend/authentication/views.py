from rest_framework import generics, permissions, status
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from rest_framework.views import APIView
import uuid
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.conf import settings

from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .throttles import LoginRateThrottle, GoogleAuthThrottle

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        # Allow login via email even though SimpleJWT uses 'username'
        if 'email' in attrs:
            attrs['username'] = attrs['email']
            
        data = super().validate(attrs)
        
        # Add user data to the response
        data['user'] = UserSerializer(self.user).data
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    throttle_classes = [LoginRateThrottle]

from rest_framework_simplejwt.tokens import RefreshToken
from core.serializers import UserSerializer

class RegisterSerializer(ModelSerializer):
    name = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'name')
        extra_kwargs = {
            'password': {'write_only': True},
            'username': {'required': False},
            'email': {'required': True}
        }
    
    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un utilisateur avec cet email existe déjà.")
        return value

    def create(self, validated_data):
        email = validated_data['email']
        username = validated_data.get('username') or email
        name = validated_data.get('name', '')
        
        first_name = name
        last_name = ''
        if name and ' ' in name:
            first_name, last_name = name.rsplit(' ', 1)

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=first_name,
            last_name=last_name
        )
        return user

class RegisterView(generics.GenericAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        print(f"Registration attempt for: {request.data.get('email')}")
        serializer = self.get_serializer(data=request.data)
        
        if not serializer.is_valid():
            print(f"Registration validation failed: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            }, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            print(f"Registration error: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': "Une erreur est survenue lors de l'inscription."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser

class UserMeView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_object(self):
        return self.request.user

class ChangePasswordView(generics.UpdateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def update(self, request, *args, **kwargs):
        user = self.request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({'detail': 'Ancien mot de passe incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        
        # Update session/token might be needed depending on auth strategy, but for JWT usually fine until refresh?
        # Actually changing password might invalidate tokens in some setups, but simple implementation first.
        return Response({'detail': 'Mot de passe modifié avec succès.'}, status=status.HTTP_200_OK)

class RequestPasswordResetView(generics.GenericAPIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            # In a real app, send email here. For now, mock success.
            # send_reset_email(user) 
            print(f"MOCK: Sending password reset email to {email}")
            return Response({'detail': 'Si cet email existe, un lien a été envoyé.'}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            # Return 200 to avoid leaking user existence
            return Response({'detail': 'Si cet email existe, un lien a été envoyé.'}, status=status.HTTP_200_OK)

from core.models import Task
from core.serializers import TaskSerializer

class ExportUserDataView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        tasks = Task.objects.filter(user=user)
        
        data = {
            'user': UserSerializer(user).data,
            'tasks': TaskSerializer(tasks, many=True).data,
            'exported_at': str(uuid.uuid4()) # just a unique id or timestamp
        }
        return Response(data, status=status.HTTP_200_OK)

class LogoutView(generics.GenericAPIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class GoogleAuthView(APIView):
    """Verify Google ID token and return JWT tokens for the user."""
    permission_classes = (permissions.AllowAny,)
    throttle_classes = [GoogleAuthThrottle]

    def post(self, request):
        credential = request.data.get('credential')
        if not credential:
            return Response(
                {'detail': 'Token Google manquant.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        client_id = settings.GOOGLE_CLIENT_ID
        if not client_id:
            return Response(
                {'detail': 'Google OAuth non configuré.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            idinfo = id_token.verify_oauth2_token(
                credential,
                google_requests.Request(),
                client_id
            )
        except ValueError as e:
            print(f"Google token verification failed: {e}")
            return Response(
                {'detail': 'Token Google invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        email = idinfo.get('email')
        first_name = idinfo.get('given_name', '')
        last_name = idinfo.get('family_name', '')
        picture = idinfo.get('picture', '')
        google_sub = idinfo.get('sub', '')  # Unique Google user ID

        if not email:
            return Response(
                {'detail': 'Email non disponible depuis Google.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Get or create user by email
        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                'username': email,
                'first_name': first_name,
                'last_name': last_name,
            }
        )

        if created:
            # New user from Google — set unusable password
            user.set_unusable_password()
            if picture:
                user.avatar = picture
            user.save()
        else:
            # Update name if available
            updated = False
            if first_name and not user.first_name:
                user.first_name = first_name
                updated = True
            if last_name and not user.last_name:
                user.last_name = last_name
                updated = True
            if picture and not user.avatar:
                user.avatar = picture
                updated = True
            if updated:
                user.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'created': created,
        }, status=status.HTTP_200_OK)
