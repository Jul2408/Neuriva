
from django.db import models
from django.contrib.auth.models import AbstractUser
import uuid

# ===========================
# 1. MODÈLE UTILISATEUR
# ===========================

class User(AbstractUser):
    """Utilisateur NEURIVA"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    email = models.EmailField(unique=True)
    timezone = models.CharField(max_length=50, default='UTC')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    
    # Préférences
    preferences = models.JSONField(default=dict, blank=True)  # theme, density, language...
    notification_settings = models.JSONField(default=dict, blank=True)  # email_digest, push_tasks...

    notification_level = models.CharField( # Deprecated but kept for compatibility for now, or removed if migrated
        max_length=20,
        choices=[
            ('minimal', 'Minimal'),
            ('normal', 'Normal'),
            ('maximum', 'Maximum')
        ],
        default='normal'
    )
    
    ai_tone = models.CharField(
        max_length=20,
        choices=[
            ('robot', 'Robot'),
            ('coach', 'Coach'),
            ('zen', 'Zen')
        ],
        default='coach'
    )
    
    # Premium
    is_premium = models.BooleanField(default=False)
    premium_until = models.DateTimeField(null=True, blank=True)
    
    # Statistiques
    total_tasks_completed = models.IntegerField(default=0)
    current_streak = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.email


# ===========================
# 2. MODÈLE TÂCHE
# ===========================

class Task(models.Model):
    """Tâche intelligente"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    
    # Contenu
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Timing
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True)
    estimated_duration = models.IntegerField(help_text="En minutes")
    actual_duration = models.IntegerField(null=True, blank=True)
    
    # Statut
    status = models.CharField(
        max_length=20,
        choices=[
            ('todo', 'À faire'),
            ('in_progress', 'En cours'),
            ('done', 'Terminée'),
            ('cancelled', 'Annulée')
        ],
        default='todo'
    )
    
    # Priorité (calculée par l'IA)
    priority_score = models.FloatField(default=0.5)  # 0 à 1
    priority_label = models.CharField(
        max_length=20,
        choices=[
            ('low', 'Basse'),
            ('medium', 'Moyenne'),
            ('high', 'Haute'),
            ('urgent', 'Urgente')
        ],
        default='medium'
    )
    
    # Risque (calculé par l'IA)
    risk_level = models.CharField(
        max_length=20,
        choices=[
            ('none', 'Aucun'),
            ('low', 'Faible'),
            ('medium', 'Moyen'),
            ('high', 'Élevé')
        ],
        default='none'
    )
    risk_reason = models.TextField(blank=True)
    
    # Comportement
    times_postponed = models.IntegerField(default=0)
    last_postponed_at = models.DateTimeField(null=True, blank=True)
    
    # Métadonnées
    tags = models.JSONField(default=list, blank=True)
    context = models.CharField(max_length=50, blank=True)  # travail, personnel, etc.
    
    completed_at = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        ordering = ['-priority_score', 'due_date']
    
    def __str__(self):
        return self.title


# ===========================
# 3. MODÈLE HABITUDES
# ===========================

class Habit(models.Model):
    """Habitude détectée automatiquement"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='habits')
    
    # Type
    habit_type = models.CharField(
        max_length=50,
        choices=[
            ('productive_hour', 'Heure productive'),
            ('procrastination', 'Procrastination'),
            ('delay_pattern', 'Pattern de retard'),
            ('completion_rate', 'Taux de complétion'),
            ('energy_level', 'Niveau d\'énergie')
        ]
    )
    
    # Données
    pattern_data = models.JSONField()  # Structure flexible
    confidence_score = models.FloatField()  # 0 à 1
    
    # Exemple pattern_data:
    # {
    #   "time_range": "10:00-12:00",
    #   "completion_rate": 0.87,
    #   "sample_size": 45
    # }
    
    detected_at = models.DateTimeField(auto_now_add=True)
    last_confirmed = models.DateTimeField(auto_now=True)
    
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.email} - {self.habit_type}"


# ===========================
# 4. MODÈLE DÉCISION IA
# ===========================

class AIDecision(models.Model):
    """Historique des décisions de l'IA"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Décision
    decision_type = models.CharField(
        max_length=50,
        choices=[
            ('prioritization', 'Priorisation'),
            ('reminder', 'Rappel'),
            ('postpone_suggestion', 'Suggestion report'),
            ('risk_alert', 'Alerte risque'),
            ('focus_mode', 'Mode focus')
        ]
    )
    
    # Contexte
    context_data = models.JSONField()  # État au moment de la décision
    
    # Décision prise
    decision = models.TextField()
    reasoning = models.TextField()  # Explication
    
    # Résultat
    user_action = models.CharField(
        max_length=50,
        choices=[
            ('accepted', 'Acceptée'),
            ('rejected', 'Refusée'),
            ('ignored', 'Ignorée'),
            ('modified', 'Modifiée')
        ],
        null=True,
        blank=True
    )
    
    effectiveness_score = models.FloatField(null=True, blank=True)  # 0 à 1
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']


# ===========================
# 5. MODÈLE NOTIFICATION
# ===========================

class Notification(models.Model):
    """Notifications/Rappels"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, null=True, blank=True)
    
    # Contenu
    title = models.CharField(max_length=200)
    body = models.TextField()
    
    # Type
    notification_type = models.CharField(
        max_length=30,
        choices=[
            ('reminder', 'Rappel'),
            ('alert', 'Alerte'),
            ('suggestion', 'Suggestion'),
            ('achievement', 'Succès')
        ]
    )
    
    # Timing
    scheduled_for = models.DateTimeField()
    sent_at = models.DateTimeField(null=True, blank=True)
    
    # Statut
    is_sent = models.BooleanField(default=False)
    is_read = models.BooleanField(default=False)
    
    # Métadonnées
    action_data = models.JSONField(default=dict, blank=True)  # Action à effectuer
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['scheduled_for']


# ===========================
# 6. MODÈLE CHARGE MENTALE
# ===========================

class MentalLoad(models.Model):
    """Historique de charge mentale"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Score (0-10)
    load_score = models.FloatField()
    
    # Facteurs
    active_tasks_count = models.IntegerField()
    urgent_tasks_count = models.IntegerField()
    overdue_tasks_count = models.IntegerField()
    
    # Contexte
    time_of_day = models.TimeField()
    day_of_week = models.IntegerField()  # 0=lundi
    
    recorded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-recorded_at']


# ===========================
# 7. MODÈLE SESSION FOCUS
# ===========================

class FocusSession(models.Model):
    """Session de concentration"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Durée
    planned_duration = models.IntegerField(help_text="En minutes")
    actual_duration = models.IntegerField(null=True, blank=True)
    
    # Timing
    started_at = models.DateTimeField()
    ended_at = models.DateTimeField(null=True, blank=True)
    
    # Résultat
    completed = models.BooleanField(default=False)
    interruptions_count = models.IntegerField(default=0)
    
    # Feedback utilisateur
    productivity_rating = models.IntegerField(null=True, blank=True)  # 1-5
    
    created_at = models.DateTimeField(auto_now_add=True)


# ===========================
# 8. MODÈLE SYNC (offline)
# ===========================

class SyncQueue(models.Model):
    """File d'attente synchronisation offline"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    
    # Action
    action_type = models.CharField(
        max_length=20,
        choices=[
            ('create', 'Création'),
            ('update', 'Mise à jour'),
            ('delete', 'Suppression')
        ]
    )
    
    model_name = models.CharField(max_length=50)  # Task, Notification, etc.
    object_id = models.UUIDField()
    
    # Données
    data = models.JSONField()
    
    # Statut
    synced = models.BooleanField(default=False)
    synced_at = models.DateTimeField(null=True, blank=True)
    
    # Gestion conflits
    conflict_detected = models.BooleanField(default=False)
    conflict_resolution = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
