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
        
        # Check last completed task date (excluding this one if possible, but simpler to just check User metadata if we tracked it)
        # Better: We need a 'last_streak_update' on User or infer from Tasks.
        # Let's check the latest task completed BEFORE today.
        
        last_task_done = Task.objects.filter(
            user=user, 
            status='done',
            completed_at__lt=today
        ).order_by('-completed_at').first()
        
        # Determine if streak continues
        should_increment = False
        
        if not last_task_done:
            # First task ever or first valid one
            if user.current_streak == 0:
                user.current_streak = 1
                should_increment = True
        else:
            last_date = last_task_done.completed_at.date() if last_task_done.completed_at else last_task_done.created_at.date() # Fallback
            delta = (today - last_date).days
            
            if delta == 1:
                # Consecutive day
                # Check if we already incremented today? 
                # If we rely on stored streak, we need to know if it was updated today.
                # A simple heuristic: If we haven't done any OTHER task today, increment.
                tasks_done_today_count = Task.objects.filter(
                    user=user, 
                    status='done',
                    completed_at__date=today
                ).count()
                
                # If this is the FIRST task done today (count is 1 including this one, or we filter exclude self)
                # Actually post_save runs after save. So count should include it.
                if tasks_done_today_count == 1:
                     user.current_streak += 1
                     should_increment = True
            elif delta > 1:
                # Streak broken
                user.current_streak = 1
                should_increment = True
            # else delta == 0: already played today, do nothing.

        if should_increment:
            user.save()
