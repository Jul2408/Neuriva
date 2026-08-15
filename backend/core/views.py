
from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.utils import timezone
from asgiref.sync import async_to_sync
import asyncio
import traceback

from .models import (
    Task, Habit, AIDecision, Notification, MentalLoad,
    FocusSession, SyncQueue, ChatConversation, ChatMessage
)
from .serializers import (
    TaskSerializer, HabitSerializer, AIDecisionSerializer,
    NotificationSerializer, MentalLoadSerializer, FocusSessionSerializer,
    SyncQueueSerializer, UserSerializer,
    ChatConversationSerializer, ChatConversationListSerializer, ChatMessageSerializer
)
from .ai_service import NEURIVAAIService


# ============================================
# Base ViewSet avec filtrage par utilisateur
# ============================================

class BaseUserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ============================================
# ViewSets Métier
# ============================================

class TaskViewSet(BaseUserViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer


class HabitViewSet(BaseUserViewSet):
    queryset = Habit.objects.all()
    serializer_class = HabitSerializer


class AIDecisionViewSet(BaseUserViewSet):
    queryset = AIDecision.objects.all()
    serializer_class = AIDecisionSerializer


class NotificationViewSet(BaseUserViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer


class MentalLoadViewSet(BaseUserViewSet):
    queryset = MentalLoad.objects.all()
    serializer_class = MentalLoadSerializer


class FocusSessionViewSet(BaseUserViewSet):
    queryset = FocusSession.objects.all()
    serializer_class = FocusSessionSerializer


class SyncQueueViewSet(BaseUserViewSet):
    queryset = SyncQueue.objects.all()
    serializer_class = SyncQueueSerializer


# ============================================
# ViewSets Chat IA - Conversations Persistantes
# ============================================

class ChatConversationViewSet(viewsets.ModelViewSet):
    """CRUD pour les conversations IA persistantes"""
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return ChatConversation.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return ChatConversationSerializer
        return ChatConversationListSerializer

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=True, methods=['patch'], url_path='rename')
    def rename(self, request, pk=None):
        """Renommer une conversation"""
        conversation = self.get_object()
        title = request.data.get('title', '').strip()
        if not title:
            return Response({'error': 'Titre requis'}, status=400)
        conversation.title = title[:100]
        conversation.save(update_fields=['title'])
        return Response({'id': str(conversation.id), 'title': conversation.title})


# ============================================
# Dashboard
# ============================================

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        week_start = today - timezone.timedelta(days=today.weekday())

        active_tasks = Task.objects.filter(
            user=user, status__in=['todo', 'in_progress']
        ).order_by('-priority_score', 'due_date')[:5]
        tasks_data = TaskSerializer(active_tasks, many=True).data

        priority_task = Task.objects.filter(
            user=user, status__in=['todo', 'in_progress']
        ).order_by('-priority_score', 'due_date').first()
        priority_task_data = TaskSerializer(priority_task).data if priority_task else None

        total_tasks = Task.objects.filter(user=user).count()
        completed_tasks = Task.objects.filter(user=user, status='done').count()
        urgent_tasks = Task.objects.filter(user=user, priority_label='urgent').count()

        today_focus_sessions = FocusSession.objects.filter(user=user, started_at__date=today)
        focus_minutes = sum(s.actual_duration or 0 for s in today_focus_sessions)

        week_tasks = Task.objects.filter(user=user, created_at__date__gte=week_start)
        week_total = week_tasks.count()
        week_completed = week_tasks.filter(status='done').count()
        week_progress = int((week_completed / week_total * 100)) if week_total > 0 else 0

        mental_load = MentalLoad.objects.filter(user=user).order_by('-recorded_at').first()
        load_data = MentalLoadSerializer(mental_load).data if mental_load else None

        return Response({
            'user': UserSerializer(user).data,
            'stats': {
                'total_tasks': total_tasks,
                'completed_tasks': completed_tasks,
                'urgent_tasks': urgent_tasks,
                'streak': user.current_streak,
                'focus_time': focus_minutes,
                'week_progress': week_progress
            },
            'recent_tasks': tasks_data,
            'priority_task': priority_task_data,
            'mental_load': load_data,
            'ai_insight': {
                'text': "Vous êtes 87% plus productif entre 10h et 12h. J'ai déplacé vos tâches complexes dans ce créneau.",
                'type': 'productivity'
            }
        })


# ============================================
# Chat IA avec persistance des messages
# ============================================

class AIChatView(APIView):
    """
    Endpoint pour le chat avec l'IA NEURIVA.
    Sauvegarde tous les messages en base de données.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        message = request.data.get('message', '').strip()
        history = request.data.get('conversation_history', [])
        conversation_id = request.data.get('conversation_id')

        if not message:
            return Response({'error': 'Message vide'}, status=400)

        # --- Résolution de la conversation ---
        conversation = None
        if conversation_id:
            try:
                conversation = ChatConversation.objects.get(id=conversation_id, user=user)
            except ChatConversation.DoesNotExist:
                pass

        if not conversation:
            # Créer une nouvelle conversation avec le début du message comme titre
            title = message[:60] if len(message) > 5 else 'Nouvelle conversation'
            conversation = ChatConversation.objects.create(user=user, title=title)

        # --- Sauvegarder le message utilisateur ---
        ChatMessage.objects.create(
            conversation=conversation,
            role='user',
            content=message
        )

        # --- Construire l'historique depuis la BDD (sans le message qu'on vient d'ajouter) ---
        if not history:
            db_messages = list(conversation.messages.order_by('timestamp'))
            if db_messages:
                db_messages = db_messages[:-1]
            history = [{'role': m.role, 'content': m.content} for m in db_messages]

        # --- Appel à l'IA ---
        try:
            ai_service = NEURIVAAIService(user)
            response_text = async_to_sync(ai_service.chat)(message, history)

            # Sauvegarder la réponse IA
            ChatMessage.objects.create(
                conversation=conversation,
                role='assistant',
                content=response_text
            )

            # Mettre à jour l'horodatage de la conversation
            ChatConversation.objects.filter(pk=conversation.pk).update(updated_at=timezone.now())

            return Response({
                'message': response_text,
                'timestamp': timezone.now().isoformat(),
                'conversation_id': str(conversation.id)
            })

        except Exception as e:
            traceback.print_exc()
            return Response({
                'error': str(e),
                'fallback': "Erreur technique côté serveur."
            }, status=500)
