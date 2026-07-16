# 🔐 Système d'Authentification NEURIVA

## Architecture

Le système d'authentification de NEURIVA utilise:
- **Frontend**: Next.js 14 avec Context API
- **Backend**: Django REST Framework avec JWT
- **Storage**: localStorage pour les tokens et données utilisateur

## Structure

```
lib/
├── api/
│   └── apiService.ts          # Service API pour Django
├── context/
│   └── AuthContext.tsx        # Context global d'authentification
types/
└── user.ts                    # Types TypeScript
```

## Configuration

### 1. Variables d'environnement

Créez un fichier `.env.local` à la racine du projet:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 2. Backend Django

Assurez-vous que votre backend Django expose les endpoints suivants:

#### Endpoints requis

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/login/` | POST | Connexion utilisateur |
| `/api/auth/register/` | POST | Inscription utilisateur |
| `/api/auth/logout/` | POST | Déconnexion |
| `/api/auth/refresh/` | POST | Rafraîchir le token |
| `/api/auth/me/` | GET | Obtenir l'utilisateur actuel |
| `/api/auth/reset-password/` | POST | Réinitialiser le mot de passe |

#### Format des requêtes/réponses

**Login** (`POST /api/auth/login/`)
```json
// Request
{
  "email": "user@example.com",
  "password": "password123"
}

// Response
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "user@example.com",
    "isPremium": false,
    "preferences": { ... },
    "stats": { ... }
  },
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

**Register** (`POST /api/auth/register/`)
```json
// Request
{
  "name": "John Doe",
  "email": "user@example.com",
  "password": "SecurePass123"
}

// Response (même format que login)
{
  "user": { ... },
  "access": "jwt_access_token",
  "refresh": "jwt_refresh_token"
}
```

## Utilisation

### Dans un composant

```tsx
'use client';

import { useAuth } from '@/lib/context/AuthContext';

export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  if (!isAuthenticated) {
    return <div>Non connecté</div>;
  }

  return (
    <div>
      <p>Bonjour {user?.name}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  );
}
```

### Appels API

```tsx
import { apiService } from '@/lib/api/apiService';

// Récupérer les tâches
const tasks = await apiService.getTasks();

// Créer une tâche
const newTask = await apiService.createTask({
  title: 'Ma tâche',
  description: 'Description'
});
```

## Flux d'authentification

### 1. Inscription
```
User → Register Page → AuthContext.register() → API → Django
                                                        ↓
User ← Redirect to Onboarding ← Store tokens ← Response
```

### 2. Connexion
```
User → Login Page → AuthContext.login() → API → Django
                                                   ↓
User ← Redirect to Dashboard ← Store tokens ← Response
```

### 3. Rafraîchissement automatique
```
API Call → 401 Error → apiService.refreshToken() → Django
                                                      ↓
Retry API Call ← Update access token ← New token
```

## Sécurité

### Tokens
- **Access Token**: Stocké dans `localStorage`, durée de vie courte (15-30 min)
- **Refresh Token**: Stocké dans `localStorage`, durée de vie longue (7-30 jours)

### Protection des routes

Pour protéger une page, utilisez le hook `useAuth`:

```tsx
'use client';

import { useAuth } from '@/lib/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return <div>Contenu protégé</div>;
}
```

## Gestion des erreurs

Le système gère automatiquement:
- ✅ Tokens expirés (rafraîchissement automatique)
- ✅ Erreurs réseau
- ✅ Validation des formulaires
- ✅ Messages d'erreur utilisateur

## Prochaines étapes

- [ ] Ajouter l'authentification à 2 facteurs
- [ ] Implémenter OAuth (Google, GitHub)
- [ ] Ajouter la gestion des sessions
- [ ] Implémenter le rate limiting
