# 🧠 NEURIVA - Documentation Complète & Définitive

Le cerveau personnel intelligent, offline-first


1. Présentation générale du projet

NEURIVA est une application web intelligente (Progressive Web App – PWA) qui agit comme un cerveau personnel numérique. Elle accompagne l’utilisateur dans sa vie quotidienne, apprend progressivement son comportement, anticipe les problèmes (retards, oublis, surcharge mentale) et propose des actions concrètes au bon moment.

Contrairement aux IA classiques (ChatGPT, assistants vocaux), NEURIVA n’est pas centrée sur la discussion, mais sur l’action, l’anticipation et l’adaptation à la personne.

Elle fonctionne avec ou sans connexion internet, ce qui la rend particulièrement utile aussi bien en Afrique qu’en Europe.

## 📋 Table des matières
1. [Architecture technique complète](#1-architecture-technique-complète)
2. [Structure des fichiers (Next.js)](#2-structure-complète-des-fichiers)
3. [Base de données (modèles Django)](#3-base-de-données-django-models)
4. [Pages de l'application (13 pages détaillées)](#4-pages-de-lapplication-13-pages-détaillées)
5. [Composants réutilisables](#5-composants-réutilisables)
6. [Système IA (cerveau local + cloud)](#6-système-ia-cerveau-local--cloud)
7. [Système offline (PWA)](#7-système-offline-pwa)
8. [API Routes](#8-api-routes)
9. [Outils & stack technique](#9-outils--stack-technique)
10. [Django Backend (structure)](#10-django-backend-structure)
11. [Prochaines étapes (roadmap)](#11-prochaines-étapes-roadmap)

---

## 🏗️ 1. ARCHITECTURE TECHNIQUE COMPLÈTE
```text
┌─────────────────────────────────────────────────────────┐
│                      UTILISATEUR                         │
└─────────────────────┬───────────────────────────────────┘
                      │
         ┌────────────▼────────────┐
         │   NEXT.JS (Frontend)    │
         │   + PWA + Service Worker│
         └────────────┬────────────┘
                      │
         ┌────────────▼────────────┐
         │     IndexedDB (Local)    │
         │   + LocalStorage (Prefs) │
         └────────────┬────────────┘
                      │
              ┌───────▼────────┐
              │  Mode Offline? │
              └───┬────────┬───┘
                  │        │
            OUI ──┘        └── NON
             │                  │
    ┌────────▼─────┐   ┌────────▼─────────┐
    │ Cerveau Local│   │ API Routes Next  │
    │ (Règles IA)  │   │ (auth, sync)     │
    └──────────────┘   └────────┬─────────┘
                                │
                       ┌────────▼─────────┐
                       │  Django Backend  │
                       │  + PostgreSQL    │
                       └────────┬─────────┘
                                │
                       ┌────────▼─────────┐
                       │  IA Cloud (GPT)  │
                       │  Analyse profonde│
                       └──────────────────┘
```

---

## 📁 2. STRUCTURE COMPLÈTE DES FICHIERS
```text
neuriva/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout principal
│   ├── page.tsx                 # Landing page
│   ├── globals.css              # Styles globaux
│   │
│   ├── onboarding/              # PAGE 1: Onboarding
│   │   ├── page.tsx
│   │   ├── steps/
│   │   │   ├── step1-problems.tsx
│   │   │   ├── step2-habits.tsx
│   │   │   └── step3-preferences.tsx
│   │   └── layout.tsx
│   │
│   ├── dashboard/               # PAGE 2: Dashboard (cœur)
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── ActionCard.tsx
│   │   │   ├── MentalLoadGauge.tsx
│   │   │   ├── NextActions.tsx
│   │   │   └── QuickStats.tsx
│   │   └── layout.tsx
│   │
│   ├── tasks/                   # PAGE 3: Tâches intelligentes
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx         # Détail tâche
│   │   │   └── edit/page.tsx    # Édition
│   │   ├── new/page.tsx         # Nouvelle tâche
│   │   └── components/
│   │       ├── TaskList.tsx
│   │       ├── TaskCard.tsx
│   │       ├── PriorityBadge.tsx
│   │       └── RiskIndicator.tsx
│   │
│   ├── chat/                    # PAGE 4: Chat IA
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── MessageList.tsx
│   │   │   ├── MessageInput.tsx
│   │   │   ├── OfflineIndicator.tsx
│   │   │   └── SuggestionChips.tsx
│   │   └── layout.tsx
│   │
│   ├── why/                     # PAGE 5: Pourquoi ? (Explications IA)
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── DecisionTimeline.tsx
│   │   │   ├── BehaviorInsights.tsx
│   │   │   ├── LearningProgress.tsx
│   │   │   └── PatternCard.tsx
│   │   └── layout.tsx
│   │
│   ├── calendar/                # PAGE 6: Vue calendrier
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── CalendarView.tsx
│   │   │   ├── DayView.tsx
│   │   │   └── WeekView.tsx
│   │   └── layout.tsx
│   │
│   ├── focus/                   # PAGE 7: Mode Focus
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── Timer.tsx
│   │   │   ├── BreathingExercise.tsx
│   │   │   └── FocusStats.tsx
│   │   └── layout.tsx
│   │
│   ├── insights/                # PAGE 8: Statistiques & Insights
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── ProductivityChart.tsx
│   │   │   ├── HabitsHeatmap.tsx
│   │   │   ├── WeeklyReport.tsx
│   │   │   └── AchievementsList.tsx
│   │   └── layout.tsx
│   │
│   ├── profile/                 # PAGE 9: Profil utilisateur
│   │   ├── page.tsx
│   │   ├── settings/
│   │   │   └── page.tsx         # PAGE 10: Paramètres
│   │   ├── preferences/
│   │   │   └── page.tsx         # PAGE 11: Préférences IA
│   │   └── components/
│   │       ├── ProfileCard.tsx
│   │       ├── SettingsGroup.tsx
│   │       └── PrivacyToggle.tsx
│   │
│   ├── premium/                 # PAGE 12: Premium (upgrade)
│   │   ├── page.tsx
│   │   ├── components/
│   │   │   ├── PricingTable.tsx
│   │   │   ├── FeatureComparison.tsx
│   │   │   └── TestimonialCard.tsx
│   │   └── layout.tsx
│   │
│   ├── auth/                    # PAGE 13: Authentification
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── reset-password/page.tsx
│   │
│   └── api/                     # API Routes Next.js
│       ├── auth/
│       │   ├── login/route.ts
│       │   ├── register/route.ts
│       │   └── refresh/route.ts
│       ├── sync/
│       │   ├── upload/route.ts
│       │   └── download/route.ts
│       ├── ai/
│       │   ├── analyze/route.ts
│       │   └── suggest/route.ts
│       └── offline/
│           └── queue/route.ts
│
├── components/                   # Composants globaux réutilisables
│   ├── ui/                      # Composants UI de base
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Modal.tsx
│   │   ├── Toast.tsx
│   │   ├── Spinner.tsx
│   │   └── ProgressBar.tsx
│   │
│   ├── layout/                  # Composants layout
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BottomNav.tsx
│   │   └── Container.tsx
│   │
│   └── shared/                  # Composants partagés
│       ├── EmptyState.tsx
│       ├── ErrorBoundary.tsx
│       ├── LoadingScreen.tsx
│       └── OfflineBanner.tsx
│
├── lib/                         # Logique métier
│   ├── brain/                   # 🧠 CERVEAU LOCAL (IA OFFLINE)
│   │   ├── core.ts             # Moteur principal
│   │   ├── analyzer.ts         # Analyse comportement
│   │   ├── decision-engine.ts  # Prise de décision
│   │   ├── pattern-detector.ts # Détection patterns
│   │   ├── priority-calculator.ts
│   │   ├── time-estimator.ts
│   │   └── rules/
│   │       ├── delay-prevention.ts
│   │       ├── overload-detection.ts
│   │       └── habit-learning.ts
│   │
│   ├── offline/                 # Gestion offline
│   │   ├── indexeddb.ts        # Wrapper IndexedDB
│   │   ├── sync-manager.ts     # Synchronisation
│   │   ├── queue-manager.ts    # File d'attente
│   │   └── conflict-resolver.ts
│   │
│   ├── notifications/           # Système notifications
│   │   ├── notification-manager.ts
│   │   ├── scheduler.ts
│   │   └── permission-handler.ts
│   │
│   ├── ai/                      # IA Cloud (optionnelle)
│   │   ├── chat-handler.ts
│   │   ├── deep-analysis.ts
│   │   └── personalization.ts
│   │
│   ├── hooks/                   # Custom React Hooks
│   │   ├── useAuth.ts
│   │   ├── useTasks.ts
│   │   ├── useOffline.ts
│   │   ├── useBrain.ts
│   │   └── useNotifications.ts
│   │
│   └── utils/                   # Utilitaires
│       ├── date.ts
│       ├── format.ts
│       ├── validation.ts
│       └── constants.ts
│
├── types/                       # Types TypeScript
│   ├── task.ts
│   ├── user.ts
│   ├── brain.ts
│   ├── notification.ts
│   └── api.ts
│
├── public/                      # Assets statiques
│   ├── icons/                   # Icônes PWA
│   │   ├── icon-192.png
│   │   ├── icon-512.png
│   │   └── favicon.ico
│   ├── manifest.json           # Manifest PWA
│   └── service-worker.js       # Service Worker
│
├── styles/                      # Styles additionnels
│   └── themes.css              # Variables CSS
│
├── middleware.ts                # Middleware Next.js (auth)
├── next.config.js              # Config Next.js
├── tailwind.config.js          # Config Tailwind
├── tsconfig.json               # Config TypeScript
└── package.json                # Dépendances
```

---

## 🗄️ 3. BASE DE DONNÉES (DJANGO MODELS)
```python
# backend/core/models.py

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
    
    # Préférences
    notification_level = models.CharField(
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
```

---

## 📄 4. PAGES DE L'APPLICATION (13 PAGES DÉTAILLÉES)

### PAGE 0: LANDING PAGE (`app/page.tsx`)
**Objectif**: Convaincre en moins de 10 secondes

**Contenu**:
- **Section Hero**:
  - Titre accrocheur: "Votre cerveau personnel intelligent"
  - Sous-titre: "NEURIVA anticipe vos retards, organise vos journées, réduit votre stress"
  - CTA principal: "Commencer gratuitement"
  - Visuel: Animation du cerveau + dashboard
- **Section Problème** (3 cartes):
  1. "Vous oubliez constamment"
  2. "Vous êtes toujours en retard"
  3. "Vous êtes débordé"
- **Section Solution** (4 étapes visuelles):
  1. Observer → "NEURIVA apprend votre comportement"
  2. Comprendre → "Détecte vos patterns"
  3. Anticiper → "Prévoit les problèmes"
  4. Agir → "Propose des solutions"
- **Section Différence**:
  "Pourquoi NEURIVA ≠ autres apps"
  - ChatGPT: Répond / NEURIVA: Anticipe
  - Todoist: Liste / NEURIVA: Priorise intelligemment
  - Calendar: Affiche / NEURIVA: Optimise
  - Offline: ❌ / NEURIVA: ✅
- **Section Features** (6 icônes):
  - Fonctionne offline
  - Apprend de vous
  - Anticipe les problèmes
  - Explique ses décisions
  - Respecte votre vie privée
  - Gratuit pour commencer
- **Section Témoignages**: 3 cartes avec photo + citation
- **Section Pricing**: Gratuit vs Premium
- **Footer**: À propos, Contact, Confidentialité, CGU

---

### PAGE 1: ONBOARDING (`app/onboarding/page.tsx`)
**Objectif**: Comprendre l'utilisateur en 3 minutes max

**Étape 1 - Problèmes principaux** (`steps/step1-problems.tsx`)
- "Quels sont vos défis quotidiens ? (2 min)"
- Cards sélectionnables: Je suis souvent en retard, J'oublie des choses importantes, Je suis débordé, Je procrastine, Je ne sais pas par où commencer, Je dors mal à cause du stress.

**Étape 2 - Habitudes** (`steps/step2-habits.tsx`)
- "Parlons de votre rythme"
- Questions: Heure la plus productive, Nombre de tâches par jour, Niveau de stress actuel (Slider).

**Étape 3 - Préférences** (`steps/step3-preferences.tsx`)
- "Personnalisons NEURIVA"
- Questions: Ton de l'IA (Robot, Coach, Zen), Niveau de notifications, Fuseau horaire.

---

### PAGE 2: DASHBOARD (`app/dashboard/page.tsx`)
**Objectif**: Afficher l'action la plus importante MAINTENANT

**Composants**:
- `ActionCard` (prioritaire)
- `MentalLoadGauge` (jauge visuelle)
- `NextActions` (3 prochaines)
- `QuickStats` (streak, complétion)
- `OfflineBanner` (si pas de connexion)

---

### PAGE 3: TÂCHES INTELLIGENTES (`app/tasks/page.tsx`)
**Objectif**: Gérer toutes les tâches avec priorisation IA

**Fonctionnalités**:
- Tri automatique par priorité
- Badge de risque (retard détecté)
- Estimation temps (apprise)
- Swipe actions (mobile)
- Recherche intelligente
- Filtres (urgent, aujourd'hui, contexte)

---

### PAGE 4: CHAT IA (`app/chat/page.tsx`)
**Objectif**: Conversation orientée ACTION (pas bavardage)

**Fonctionnalités**:
- Mode offline : réponses prédéfinies intelligentes
- Mode online : IA conversationnelle complète
- Suggestions rapides (chips cliquables)
- Actions directes dans le chat

---

### PAGE 5: POURQUOI ? (`app/why/page.tsx`)
**Objectif**: Transparence totale sur les décisions IA

**Contenu**:
- **Tes Patterns**: Analyse de productivité, procrastination, points forts.
- **Progression**: Évolution de la charge mentale, tâches terminées, retards évités.
- **Dernières Décisions**: Historique des recommandations IA avec raisonnement.

---

### PAGE 6: CALENDRIER (`app/calendar/page.tsx`)
**Objectif**: Vue temporelle des tâches

**Fonctionnalités**:
- Drag & drop (réorganiser)
- Suggestions IA dans les créneaux libres
- Code couleur charge mentale
- Sync Google Calendar (premium)

---

### PAGE 7: MODE FOCUS (`app/focus/page.tsx`)
**Objectif**: Session de concentration profonde

**Layout**:
- **Avant la session**: Sélection de la tâche, choix de la durée (25, 45, 60 min), rappel des règles (notifications off, chat off).
- **Pendant la session**: Timer géant, barre de progression, bouton pause/stop, messages d'encouragement.
- **Après la session**: Feedback (note de productivité 1-5), statut de la tâche (finie/à continuer), suggestion de pause par NEURIVA.
- **Bonus**: Exercices de respiration guidée (4-4-4).

---

### PAGE 8: INSIGHTS & STATISTIQUES (`app/insights/page.tsx`)
**Objectif**: Analyse de performance

**Contenu**:
- **Résumé Hebdomadaire**: Tâches terminées, streak, temps de focus, progression vs semaine précédente.
- **Graphique de Productivité**: Évolution quotidienne.
- **Heatmap des Heures**: Identification des pics de productivité.
- **Taux de Complétion**: Par catégorie (Travail, Perso, Créatif).
- **Points d'Amélioration**: Conseils IA basés sur les retards détectés.
- **Succès**: Badges et accomplissements débloqués.

---

### PAGE 9: PROFIL (`app/profile/page.tsx`)
**Contenu**:
- Informations utilisateur (Nom, Email).
- Statistiques globales (Streak, Tâches, Temps de focus).
- Accès aux paramètres, préférences IA, notifications, vie privée et synchronisation.
- Gestion de l'abonnement (Gratuit vs Premium).
- Gestion des données (Export/Suppression).

---

### PAGE 10: PARAMÈTRES (`app/profile/settings/page.tsx`)
**Contenu**:
- **Notifications**: On/Off, Niveau (Minimal/Normal/Max), Son, Vibration.
- **Région**: Fuseau horaire, Langue, Format de date.
- **Apparence**: Thème (Clair/Sombre/Auto), Taille du texte.
- **Données**: Nettoyage du cache, Export.
- **Zone Dangereuse**: Réinitialisation, Suppression de compte.

---

### PAGE 11: PRÉFÉRENCES IA (`app/profile/preferences/page.tsx`)
**Contenu**:
- **Ton de l'IA**: Robot (factuel), Coach (motivant), Zen (apaisant).
- **Niveau d'intervention**: Fréquence des rappels, suggestions auto, réorganisation auto, mode "Pilote automatique".
- **Horaires**: Heures de travail, Ne pas déranger, Jours de repos.
- **Priorités**: Curseur entre Productivité, Équilibre vie pro/perso, Réduction du stress.
- **Vie Privée**: IA Cloud (On/Off), Partage de données anonymes.
- **Apprentissage**: Status de la confiance de l'IA, bouton de réinitialisation.

---

### PAGE 12: PREMIUM (`app/premium/page.tsx`)
**Objectif**: Convaincre de passer à Premium

**Contenu**:
- Tableau comparatif Gratuit vs Premium.
- Liste des avantages: IA Cloud avancée, Anticipation proactive, Insights complets, Intégrations (Google Calendar, Notion), Multi-appareils.
- Tarification: Mensuel vs Annuel (offre 2 mois gratuits).
- Témoignages et FAQ.
- Offre spéciale de bienvenue.

---

### PAGE 13: AUTHENTIFICATION (`app/auth/`)
- **Login**: Email/Password, Social Login (Google, Apple, Microsoft).
- **Register**: Nom, Email, Password, Acceptation CGU.
- **Reset Password**: Envoi de lien de réinitialisation par email.

---

## 🎨 5. COMPOSANTS RÉUTILISABLES

### UI Components (`components/ui/`)
- **Button**: Variantes (primary, secondary, danger, ghost), tailles, états loading/disabled.
- **Card**: Titre, sous-titre, badges, actions.
- **Badge**: Statuts (success, warning, danger, info).
- **Modal**: Header, body, footer, gestion d'ouverture.
- **Toast**: Notifications éphémères.
- **Input**: Labels, placeholders, erreurs, icônes.
- **ProgressBar**: Valeur, max, couleurs dynamiques.
- **Spinner**: Indicateur de chargement.

### Layout Components (`components/layout/`)
- **Header**: Logo, recherche, notifications, profil.
- **Sidebar**: Navigation principale (Desktop).
- **BottomNav**: Navigation rapide (Mobile).
- **Container**: Gestion des largeurs maximales.

### Shared Components (`components/shared/`)
- **OfflineBanner**: Alerte de mode hors-ligne.
- **EmptyState**: Illustration et message pour les listes vides.
- **ErrorBoundary**: Gestion des erreurs React.
- **LoadingScreen**: Écran de chargement global.

---

## 🧠 6. SYSTÈME IA (CERVEAU LOCAL + CLOUD)

### **Architecture IA**
Le système repose sur un **Cerveau Local** pour la réactivité et la vie privée, complété par un **Cerveau Cloud** pour les analyses complexes.

### Cerveau Local (`lib/brain/core.ts`)
```typescript
export class NeurivaBrain {
  private analyzer: BehaviorAnalyzer
  private decisionEngine: DecisionEngine
  private patternDetector: PatternDetector
  private priorityCalculator: PriorityCalculator
  private timeEstimator: TimeEstimator
  
  constructor() {
    this.analyzer = new BehaviorAnalyzer()
    this.decisionEngine = new DecisionEngine()
    this.patternDetector = new PatternDetector()
    this.priorityCalculator = new PriorityCalculator()
    this.timeEstimator = new TimeEstimator()
  }
  
  async getCurrentAction(tasks: Task[], context: Context): Promise<Action> {
    const habits = await this.analyzer.getUserHabits()
    const prioritizedTasks = await this.priorityCalculator.calculate(tasks, habits, context)
    const riskyTasks = await this.detectRisks(prioritizedTasks)
    const action = await this.decisionEngine.decide({
      tasks: prioritizedTasks,
      risks: riskyTasks,
      context,
      habits
    })
    await this.logDecision(action)
    return action
  }
  
  async getMentalLoad(tasks: Task[]): Promise<MentalLoad> {
    const activeTasks = tasks.filter(t => t.status === 'todo')
    const urgentTasks = activeTasks.filter(t => t.priority_label === 'urgent')
    const overdueTasks = activeTasks.filter(t => this.isOverdue(t))
    
    const score = Math.min(10, (activeTasks.length * 0.3) + (urgentTasks.length * 2) + (overdueTasks.length * 3))
    
    return {
      score: Math.round(score),
      label: this.getMentalLoadLabel(score),
      color: this.getMentalLoadColor(score),
      factors: { active: activeTasks.length, urgent: urgentTasks.length, overdue: overdueTasks.length }
    }
  }
  
  async getNextActions(tasks: Task[], limit: number = 3): Promise<Task[]> {
    const sorted = await this.priorityCalculator.sortByPriority(tasks)
    return sorted.slice(0, limit)
  }

  private async detectRisks(tasks: Task[]): Promise<Risk[]> {
    const risks: Risk[] = []
    for (const task of tasks) {
      if (task.times_postponed >= 3) {
        risks.push({ taskId: task.id, type: 'procrastination', level: 'high', reason: `Reportée ${task.times_postponed} fois`, suggestion: 'Décomposer en micro-tâches' })
      }
      if (this.isDeadlineClose(task, 2)) {
        risks.push({ taskId: task.id, type: 'deadline', level: 'urgent', reason: 'Deadline dans moins de 2h', suggestion: 'À faire MAINTENANT' })
      }
    }
    return risks
  }

  private isOverdue(task: Task): boolean {
    if (!task.due_date) return false
    return new Date(task.due_date) < new Date()
  }

  private isDeadlineClose(task: Task, hours: number): boolean {
    if (!task.due_date) return false
    const deadline = new Date(task.due_date)
    const now = new Date()
    const diff = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60)
    return diff > 0 && diff <= hours
  }

  private getMentalLoadLabel(score: number): string {
    if (score <= 3) return 'Léger'; if (score <= 5) return 'Normal'; if (score <= 7) return 'Chargé'; return 'Surchargé'
  }

  private getMentalLoadColor(score: number): string {
    if (score <= 3) return 'green'; if (score <= 5) return 'yellow'; if (score <= 7) return 'orange'; return 'red'
  }

  private async logDecision(action: Action): Promise<void> {
    // Log to IndexedDB
  }
}
```

### Analyseur de Comportement (`lib/brain/analyzer.ts`)
```typescript
export class BehaviorAnalyzer {
  async getUserHabits(): Promise<UserHabits> {
    const tasks = await db.tasks.getAll()
    const completedTasks = tasks.filter(t => t.status === 'done')
    
    return {
      productiveHours: await this.analyzeProductiveHours(completedTasks),
      procrastinationPatterns: await this.analyzeProcrastination(tasks),
      completionRates: await this.analyzeCompletionRates(completedTasks),
      averageDuration: await this.analyzeAverageDuration(completedTasks),
      preferredContexts: await this.analyzePreferredContexts(completedTasks)
    }
  }
  
  private async analyzeProductiveHours(tasks: Task[]): Promise<ProductiveHours> {
    const hourlyTotal = new Array(24).fill(0)
    const hourlyCompletion = new Array(24).fill(0)
    
    for (const task of tasks) {
      if (!task.completed_at) continue
      const hour = new Date(task.completed_at).getHours()
      hourlyTotal[hour]++
      if (task.actual_duration && task.actual_duration <= task.estimated_duration) hourlyCompletion[hour]++
    }
    
    const rates = hourlyCompletion.map((completed, hour) => hourlyTotal[hour] > 0 ? completed / hourlyTotal[hour] : 0)
    const bestHours = rates.map((rate, hour) => ({ hour, rate })).sort((a, b) => b.rate - a.rate).slice(0, 3).filter(h => h.rate > 0.7)
    
    return { bestHours: bestHours.map(h => h.hour), confidence: this.calculateConfidence(tasks.length) }
  }

  private calculateConfidence(sampleSize: number): number {
    if (sampleSize < 10) return 0.3; if (sampleSize < 30) return 0.6; if (sampleSize < 50) return 0.8; return 0.95
  }
}
```

### Moteur de Décision (`lib/brain/decision-engine.ts`)
```typescript
export class DecisionEngine {
  async decide(input: DecisionInput): Promise<Action> {
    const { tasks, risks, context, habits } = input
    
    const criticalTask = this.findCriticalTask(tasks, risks)
    if (criticalTask) {
      return {
        type: 'urgent_task',
        task: criticalTask,
        description: `${criticalTask.title}`,
        reasoning: 'Tâche critique avec risque élevé.',
        priority: 10,
        actions: [{ label: 'Fait', type: 'complete' }, { label: '+15min', type: 'postpone' }]
      }
    }
    
    const mentalLoad = await this.calculateMentalLoad(tasks)
    if (mentalLoad >= 8) {
      return {
        type: 'overload_alert',
        description: 'Tu es en surcharge',
        reasoning: 'Trop de tâches actives. Fais une pause.',
        priority: 9,
        actions: [{ label: 'Pause 5min', type: 'break' }]
      }
    }
    
    if (habits.productiveHours.bestHours.includes(context.currentHour)) {
      const difficultTask = tasks.find(t => t.estimated_duration > 30)
      if (difficultTask) {
        return {
          type: 'optimal_timing',
          task: difficultTask,
          description: `${difficultTask.title}`,
          reasoning: 'C\'est ton heure la plus productive.',
          priority: 8,
          actions: [{ label: 'Go !', type: 'start' }]
        }
      }
    }
    
    return {
      type: 'next_priority',
      task: tasks[0],
      description: `${tasks[0].title}`,
      reasoning: 'Prochaine tâche prioritaire.',
      priority: 6,
      actions: [{ label: 'Commencer', type: 'start' }]
    }
  }

  private findCriticalTask(tasks: Task[], risks: Risk[]): Task | null {
    const urgentRisk = risks.find(r => r.level === 'urgent')
    return urgentRisk ? tasks.find(t => t.id === urgentRisk.taskId) || null : null
  }

  private async calculateMentalLoad(tasks: Task[]): Promise<number> {
    const brain = new NeurivaBrain()
    const load = await brain.getMentalLoad(tasks)
    return load.score
  }
}
```

### Priority Calculator (`lib/brain/priority-calculator.ts`)
```typescript
export class PriorityCalculator {
  async calculate(tasks: Task[], habits: UserHabits, context: Context): Promise<Task[]> {
    const tasksWithPriority = await Promise.all(
      tasks.map(async task => {
        const score = await this.calculatePriorityScore(task, habits, context)
        return { ...task, priority_score: score, priority_label: this.getPriorityLabel(score) }
      })
    )
    return this.sortByPriority(tasksWithPriority)
  }
  
  private async calculatePriorityScore(task: Task, habits: UserHabits, context: Context): Promise<number> {
    let score = 0.5
    if (task.due_date) {
      const hoursUntil = this.getHoursUntil(task.due_date)
      if (hoursUntil <= 0) score += 0.3
      else if (hoursUntil <= 2) score += 0.25
      else if (hoursUntil <= 24) score += 0.15
    }
    if (task.times_postponed > 0) score += Math.min(0.25, task.times_postponed * 0.08)
    if (habits.productiveHours.bestHours.includes(context.currentHour) && task.estimated_duration > 30) score += 0.15
    return Math.min(1, Math.max(0, score))
  }

  private getPriorityLabel(score: number): string {
    if (score >= 0.8) return 'urgent'; if (score >= 0.6) return 'high'; if (score >= 0.4) return 'medium'; return 'low'
  }

  sortByPriority(tasks: Task[]): Task[] {
    return [...tasks].sort((a, b) => b.priority_score - a.priority_score)
  }

  private getHoursUntil(date: Date | string): number {
    return (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60)
  }
}
```

### Time Estimator (`lib/brain/time-estimator.ts`)
```typescript
export class TimeEstimator {
  async estimate(task: Task): Promise<number> {
    const similarTasks = await this.findSimilarTasks(task)
    if (similarTasks.length === 0) return Math.round(task.estimated_duration * 1.2)
    const actualDurations = similarTasks.filter(t => t.actual_duration).map(t => t.actual_duration!)
    const avgDuration = actualDurations.reduce((a, b) => a + b, 0) / actualDurations.length
    const confidence = this.calculateConfidence(similarTasks.length)
    return Math.round((avgDuration * confidence) + (task.estimated_duration * (1 - confidence)))
  }

  private async findSimilarTasks(task: Task): Promise<Task[]> {
    const allTasks = await db.tasks.getTasks()
    return allTasks.filter(t => t.status === 'done' && t.context === task.context)
  }

  private calculateConfidence(sampleSize: number): number {
    if (sampleSize < 3) return 0.3; if (sampleSize < 10) return 0.6; return 0.95
  }
}
```

### IA Cloud (`lib/ai/chat-handler.ts`)
```typescript
export class CloudAIHandler {
  constructor(private apiKey: string) {}

  async chat(message: string, context: ChatContext): Promise<AIResponse> {
    const systemPrompt = `Tu es NEURIVA, assistant IA proactif. Contexte: ${context.user.name}, Charge: ${context.mentalLoad}/10.`
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${this.apiKey}` },
      body: JSON.stringify({ model: 'gpt-4', messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: message }] })
    })
    const data = await response.json()
    return { message: data.choices[0].message.content, actions: [], suggestions: [] }
  }
}
```

### Offline Responses (`lib/brain/offline-responses.ts`)
```typescript
export class OfflineResponseEngine {
  async getResponse(message: string, context: Context): Promise<AIResponse> {
    const lower = message.toLowerCase()
    if (lower.includes('faire')) return { message: "Je te suggère d'avancer sur tes tâches prioritaires.", actions: [], suggestions: [] }
    if (lower.includes('stress')) return { message: "Ta charge mentale est élevée. Respire et fais une pause.", actions: [], suggestions: [] }
    return { message: "Je suis là pour t'aider, même sans connexion.", actions: [], suggestions: [] }
  }
}
```

---

## 📶 7. SYSTÈME OFFLINE (PWA)

### Service Worker (`public/service-worker.js`)
```javascript
const CACHE_NAME = 'neuriva-v1'
const STATIC_FILES = ['/', '/dashboard', '/tasks', '/chat', '/manifest.json']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES)))
})

self.addEventListener('fetch', (event) => {
  event.respondWith(caches.match(event.request).then(response => response || fetch(event.request)))
})
```

### IndexedDB Manager (`lib/offline/indexeddb.ts`)
```typescript
import { openDB } from 'idb'

export class IndexedDBManager {
  private dbPromise = openDB('neuriva-db', 1, {
    upgrade(db) {
      db.createObjectStore('tasks', { keyPath: 'id' })
      db.createObjectStore('habits', { keyPath: 'id' })
      db.createObjectStore('decisions', { keyPath: 'id' })
    }
  })

  async getTasks() { return (await this.dbPromise).getAll('tasks') }
  async addTask(task: Task) { (await this.dbPromise).add('tasks', task) }
}
export const db = new IndexedDBManager()
```

---

## 🔌 8. API ROUTES (NEXT.JS)

### Auth & Sync
```typescript
// app/api/auth/login/route.ts
export async function POST(req: Request) {
  const credentials = await req.json()
  const res = await fetch(`${process.env.DJANGO_API_URL}/auth/login/`, { method: 'POST', body: JSON.stringify(credentials) })
  return Response.json(await res.json())
}

// app/api/sync/upload/route.ts
export async function POST(req: Request) {
  const data = await req.json()
  const res = await fetch(`${process.env.DJANGO_API_URL}/sync/upload/`, { method: 'POST', body: JSON.stringify(data) })
  return Response.json(await res.json())
}
```

---

## 🛠️ 9. OUTILS & STACK TECHNIQUE COMPLÈTE

### Configuration
```json
// package.json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.2.0",
    "idb": "^8.0.0",
    "recharts": "^2.10.0"
  }
}
```

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: { primary: '#6366f1', success: '#10b981', danger: '#ef4444' }
    }
  }
}
```

---

## 📚 10. DJANGO BACKEND (STRUCTURE)
```text
backend/
├── core/models.py      # User, Task, Habit, AIDecision
├── ai/brain.py         # Cloud AI Logic
├── sync/manager.py     # Sync Logic
└── authentication/     # JWT Auth
```

---

## 🚀 11. PROCHAINES ÉTAPES (ROADMAP)
1. **Phase 1**: MVP - Tâches, Cerveau Local, Dashboard, Offline.
2. **Phase 2**: Amélioration - Mode Focus, Statistiques, Notifications.
3. **Phase 3**: Premium - IA Cloud, Intégrations, Multi-devices.

---

## 📝 RÉSUMÉ FINAL
NEURIVA est un assistant intelligent hybride (local/cloud) conçu pour réduire la charge mentale. Il fonctionne à 100% offline grâce à une architecture PWA et IndexedDB, tout en offrant des analyses profondes via Django et GPT-4 en mode connecté.
