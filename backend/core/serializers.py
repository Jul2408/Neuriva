
from rest_framework import serializers
from .models import User, Task, Notification, Habit, AIDecision, Notification, MentalLoad, FocusSession, SyncQueue

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'first_name', 'last_name',
            'avatar', 'timezone', 'notification_level', 'ai_tone',
            'is_premium', 'total_tasks_completed', 'current_streak',
            'created_at', 'preferences', 'notification_settings'
        )
        read_only_fields = ('id', 'created_at', 'total_tasks_completed', 'current_streak', 'is_premium')

class NotificationSerializer(serializers.ModelSerializer):
    message = serializers.CharField(source='body', read_only=True)
    type = serializers.CharField(source='notification_type', read_only=True)
    created_at = serializers.DateTimeField(source='sent_at', read_only=True)
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'type', 'created_at', 'is_read', 'task']
        read_only_fields = ['id', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'user', 'priority_score', 'risk_level')

class HabitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Habit
        fields = '__all__'
        read_only_fields = ('id', 'user', 'detected_at')

class AIDecisionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AIDecision
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at')



class MentalLoadSerializer(serializers.ModelSerializer):
    class Meta:
        model = MentalLoad
        fields = '__all__'
        read_only_fields = ('id', 'user', 'recorded_at')

class FocusSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = FocusSession
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at')

class SyncQueueSerializer(serializers.ModelSerializer):
    class Meta:
        model = SyncQueue
        fields = '__all__'
        read_only_fields = ('id', 'user', 'created_at')
