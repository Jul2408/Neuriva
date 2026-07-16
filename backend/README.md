# NEURIVA Backend - Django REST API

## Structure du projet

```
backend/
├── manage.py
├── requirements.txt
├── .env
├── neuriva/              # Projet Django principal
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   ├── wsgi.py
│   └── asgi.py
├── core/                 # App principale
│   ├── models.py        # Modèles (User, Task, etc.)
│   ├── serializers.py   # Serializers DRF
│   ├── views.py         # Views API
│   ├── urls.py
│   └── admin.py
└── authentication/       # App d'authentification
    ├── models.py
    ├── serializers.py
    ├── views.py
    ├── urls.py
    └── backends.py
```

## Installation

### 1. Créer l'environnement virtuel

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 2. Installer les dépendances

```bash
pip install -r requirements.txt
```

### 3. Configuration

Créez un fichier `.env` dans `backend/`:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=sqlite:///db.sqlite3
CORS_ALLOWED_ORIGINS=http://localhost:3001,http://localhost:3000

# JWT Settings
JWT_ACCESS_TOKEN_LIFETIME=30  # minutes
JWT_REFRESH_TOKEN_LIFETIME=7  # days
```

### 4. Migrations et superuser

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
```

### 5. Lancer le serveur

```bash
python manage.py runserver
```

Le backend sera accessible sur `http://localhost:8000`

## API Endpoints

### Authentication

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/register/` | POST | Inscription |
| `/api/auth/login/` | POST | Connexion |
| `/api/auth/logout/` | POST | Déconnexion |
| `/api/auth/refresh/` | POST | Rafraîchir token |
| `/api/auth/me/` | GET | Utilisateur actuel |
| `/api/auth/reset-password/` | POST | Réinitialiser MDP |

### Tasks

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/tasks/` | GET | Liste des tâches |
| `/api/tasks/` | POST | Créer une tâche |
| `/api/tasks/{id}/` | GET | Détail d'une tâche |
| `/api/tasks/{id}/` | PATCH | Modifier une tâche |
| `/api/tasks/{id}/` | DELETE | Supprimer une tâche |

### Habits

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/habits/` | GET | Liste des habitudes |
| `/api/habits/{id}/` | GET | Détail d'une habitude |

### AI Decisions

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/ai/decisions/` | GET | Historique décisions IA |
| `/api/ai/analyze/` | POST | Analyser comportement |

## Modèles Django

Voir `NEURIVA_DOC.md` section 3 pour la structure complète des modèles.

## Tests

```bash
python manage.py test
```

## Admin Django

Accédez à l'interface admin sur `http://localhost:8000/admin`
