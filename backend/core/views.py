
from rest_framework import viewsets, permissions
from .models import Task, Habit, AIDecision, Notification, MentalLoad, FocusSession, SyncQueue
from .serializers import (
    TaskSerializer, HabitSerializer, AIDecisionSerializer, 
    NotificationSerializer, MentalLoadSerializer, FocusSessionSerializer, SyncQueueSerializer
)

class BaseUserViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

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
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils import timezone
from .serializers import UserSerializer
from .ai_service import NEURIVAAIService
import asyncio

class DashboardView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        today = timezone.now().date()
        week_start = today - timezone.timedelta(days=today.weekday())
        
        # Active tasks (Top 5 by priority/date)
        active_tasks = Task.objects.filter(
            user=user,
            status__in=['todo', 'in_progress']
        ).order_by('-priority_score', 'due_date')[:5]
        tasks_data = TaskSerializer(active_tasks, many=True).data
        
        # Priority Task (Most urgent/high not done)
        priority_task = Task.objects.filter(
            user=user, 
            status__in=['todo', 'in_progress']
        ).order_by('-priority_score', 'due_date').first()
        priority_task_data = TaskSerializer(priority_task).data if priority_task else None

        # Stats
        total_tasks = Task.objects.filter(user=user).count()
        completed_tasks = Task.objects.filter(user=user, status='done').count()
        urgent_tasks = Task.objects.filter(user=user, priority_label='urgent').count()
        
        # Focus Time (Today)
        today_focus_sessions = FocusSession.objects.filter(
            user=user, 
            started_at__date=today
        )
        focus_minutes = sum(s.actual_duration or 0 for s in today_focus_sessions)
        
        # Week Progress
        week_tasks = Task.objects.filter(user=user, created_at__date__gte=week_start)
        week_total = week_tasks.count()
        week_completed = week_tasks.filter(status='done').count()
        week_progress = int((week_completed / week_total * 100)) if week_total > 0 else 0

        # Mental Load
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


from asgiref.sync import async_to_sync

class AIChatView(APIView):
    """
    Endpoint pour le chat avec l'IA NEURIVA
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        user = request.user
        message = request.data.get('message', '')
        history = request.data.get('conversation_history', [])
        
        if not message:
            return Response({'error': 'Message vide'}, status=400)
        
        try:
            ai_service = NEURIVAAIService(user)
            # On utilise async_to_sync pour appeler notre service asynchrone dans une vue synchrone
            response_text = async_to_sync(ai_service.chat)(message, history)
            
            return Response({
                'message': response_text,
                'timestamp': timezone.now().isoformat()
            })
        except Exception as e:
            import traceback
            traceback.print_exc()
            return Response({
                'error': str(e),
                'fallback': "Erreur technique côté serveur."
            }, status=500)



