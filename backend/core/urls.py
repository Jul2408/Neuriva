
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    TaskViewSet, HabitViewSet, AIDecisionViewSet, 
    NotificationViewSet, MentalLoadViewSet, FocusSessionViewSet, SyncQueueViewSet,
    DashboardView, AIChatView
)

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)
router.register(r'habits', HabitViewSet)
router.register(r'decisions', AIDecisionViewSet)
router.register(r'notifications', NotificationViewSet)
router.register(r'mental-load', MentalLoadViewSet)
router.register(r'focus-sessions', FocusSessionViewSet)
router.register(r'sync', SyncQueueViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('dashboard/', DashboardView.as_view(), name='dashboard'),
    path('ai/chat/', AIChatView.as_view(), name='ai-chat'),
]

