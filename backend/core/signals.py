from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.contrib.auth import get_user_model
from django.apps import apps
from django.conf import settings

User = get_user_model()

@receiver(post_save, sender='core.Task')
def update_user_streak(sender, instance, created, **kwargs):
    Task = apps.get_model('core', 'Task')
    if instance.status == 'done':
        user = instance.user
        today = timezone.now().date()
        
        # Idempotent update of total tasks completed
        user.total_tasks_completed = Task.objects.filter(user=user, status='done').count()
        should_save = True
        
        last_task_done = Task.objects.filter(
            user=user, 
            status='done',
            completed_at__date__lt=today
        ).order_by('-completed_at').first()
        
        if not last_task_done:
            # First task ever or first valid one
            if user.current_streak == 0:
                user.current_streak = 1
        else:
            last_date = last_task_done.completed_at.date() if last_task_done.completed_at else last_task_done.created_at.date()
            delta = (today - last_date).days
            
            if delta == 1:
                tasks_done_today_count = Task.objects.filter(
                    user=user, 
                    status='done',
                    completed_at__date=today
                ).count()
                
                if tasks_done_today_count == 1:
                     user.current_streak += 1
            elif delta > 1:
                # Streak broken
                user.current_streak = 1

        if should_save:
            user.save(update_fields=['current_streak', 'total_tasks_completed'])
