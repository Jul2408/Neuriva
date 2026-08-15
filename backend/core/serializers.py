
from rest_framework import serializers
from .models import User, Task, Notification, Habit, AIDecision, Notification, MentalLoad, FocusSession, SyncQueue, ChatConversation, ChatMessage

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


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = ['id', 'role', 'content', 'timestamp']
        read_only_fields = ['id', 'timestamp']


class ChatConversationSerializer(serializers.ModelSerializer):
    messages = ChatMessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()

    class Meta:
        model = ChatConversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'messages', 'last_message']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {'role': last.role, 'content': last.content[:80], 'timestamp': last.timestamp}
        return None


class ChatConversationListSerializer(serializers.ModelSerializer):
    """Version allégée pour la liste (sans messages complets)"""
    last_message = serializers.SerializerMethodField()
    message_count = serializers.IntegerField(source='messages.count', read_only=True)

    class Meta:
        model = ChatConversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'last_message', 'message_count']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        last = obj.messages.last()
        if last:
            return {'role': last.role, 'content': last.content[:80], 'timestamp': last.timestamp}
        return None
