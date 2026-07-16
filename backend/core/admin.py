
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Task, Habit, AIDecision, Notification, MentalLoad, FocusSession, SyncQueue

# Customize UserAdmin if needed to show extra fields
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'is_staff', 'is_premium')
    fieldsets = UserAdmin.fieldsets + (
        ('NEURIVA Info', {'fields': ('timezone', 'notification_level', 'ai_tone', 'is_premium', 'premium_until')}),
    )

admin.site.register(User, CustomUserAdmin)
admin.site.register(Task)
admin.site.register(Habit)
admin.site.register(AIDecision)
admin.site.register(Notification)
admin.site.register(MentalLoad)
admin.site.register(FocusSession)
admin.site.register(SyncQueue)
