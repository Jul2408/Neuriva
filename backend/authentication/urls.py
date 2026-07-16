from django.urls import path
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView,
)
from .views import RegisterView, CustomTokenObtainPairView, UserMeView, ChangePasswordView, RequestPasswordResetView, ExportUserDataView, LogoutView

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('me/', UserMeView.as_view(), name='user_me'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('reset-password/', RequestPasswordResetView.as_view(), name='request_password_reset'),
    path('export/', ExportUserDataView.as_view(), name='export_user_data'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
]
