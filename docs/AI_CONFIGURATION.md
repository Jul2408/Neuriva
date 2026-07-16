# Configuration de l'IA NEURIVA

## Vue d'ensemble

NEURIVA utilise maintenant une IA intelligente et contextuelle basée sur Google Gemini pour comprendre et répondre aux questions des utilisateurs de manière personnalisée.

## Fonctionnalités de l'IA

### 🧠 Intelligence Contextuelle
L'IA a accès à:
- **Toutes vos tâches** (actives, urgentes, en retard)
- **Vos habitudes** détectées automatiquement
- **Vos statistiques** (série, tâches complétées, etc.)
- **Votre profil** (ton préféré, timezone, etc.)

### 💬 Compréhension Naturelle
L'IA comprend le langage naturel et peut répondre à des questions comme:
- "Quelle est ma prochaine tâche?"
- "Réorganise ma journée"
- "Pourquoi cette tâche est prioritaire?"
- "Aide-moi à me concentrer"
- "Comment améliorer ma productivité?"

### 🎭 Personnalités Adaptatives
L'IA adapte son ton selon vos préférences:
- **Robot** 🤖: Précis, factuel et analytique
- **Coach** 🏆: Motivant, encourageant et direct
- **Zen** 🌿: Calme, apaisant et bienveillant

## Configuration

### 1. Obtenir une clé API Gemini

1. Visitez [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Connectez-vous avec votre compte Google
3. Cliquez sur "Create API Key"
4. Copiez votre clé API

### 2. Configurer la clé dans le backend

Créez un fichier `.env` dans le dossier `backend/` avec:

```env
GEMINI_API_KEY=votre_cle_api_ici
```

### 3. Mode Fallback (sans API)

Si vous n'avez pas de clé API, l'IA fonctionnera quand même avec des réponses intelligentes basées sur des règles et le contexte de l'utilisateur.

## Utilisation

### Frontend (React/Next.js)

```typescript
import { apiService } from '@/lib/api/apiService';

// Envoyer un message à l'IA
const response = await apiService.sendAIMessage(
    "Quelle est ma prochaine tâche?",
    conversationHistory  // optionnel
);

console.log(response.message);
```

### Backend (Django)

```python
from core.ai_service import NEURIVAAIService

# Créer le service IA pour un utilisateur
ai_service = NEURIVAAIService(user)

# Obtenir une réponse
response = await ai_service.chat("Réorganise ma journée")
print(response)
```

## Endpoints API

### POST /api/ai/chat/

Envoie un message à l'IA et reçoit une réponse contextuelle.

**Request:**
```json
{
    "message": "Quelle est ma prochaine tâche?",
    "conversation_history": [
        {
            "role": "user",
            "content": "Bonjour"
        },
        {
            "role": "assistant",
            "content": "Bonjour! Comment puis-je vous aider?"
        }
    ]
}
```

**Response:**
```json
{
    "message": "Votre prochaine tâche prioritaire est **Finaliser la présentation client**...",
    "timestamp": "2026-01-05T22:57:00Z",
    "context": {
        "user": {...},
        "tasks": {...},
        "habits": {...}
    }
}
```

## Exemples de Questions

### Gestion des Tâches
- "Montre-moi mes tâches urgentes"
- "Quelle tâche devrais-je faire maintenant?"
- "Pourquoi cette tâche est-elle prioritaire?"
- "Réorganise mon planning"

### Productivité
- "Comment améliorer ma productivité?"
- "Quand suis-je le plus productif?"
- "Lance une session de focus"
- "Aide-moi à me concentrer"

### Statistiques
- "Montre mes statistiques"
- "Comment va ma série?"
- "Combien de tâches ai-je complété aujourd'hui?"

### Conseils Personnalisés
- "Pourquoi je procrastine sur cette tâche?"
- "Comment gérer mon stress?"
- "Donne-moi des conseils pour mieux m'organiser"

## Architecture

```
Frontend (Next.js)
    ↓
apiService.sendAIMessage()
    ↓
Django API (/api/ai/chat/)
    ↓
NEURIVAAIService
    ↓
Google Gemini API (ou Fallback)
    ↓
Réponse Contextuelle
```

## Sécurité

- ✅ Authentification requise (JWT)
- ✅ Données utilisateur isolées
- ✅ Historique de conversation non persisté (privacy)
- ✅ Logs des décisions IA pour amélioration
- ✅ Rate limiting recommandé en production

## Performance

- **Temps de réponse**: ~1-3 secondes avec Gemini
- **Fallback**: <100ms sans API
- **Cache**: Contexte utilisateur mis en cache
- **Optimisation**: Historique limité aux 10 derniers messages

## Amélioration Continue

L'IA enregistre ses décisions dans le modèle `AIDecision` pour:
- Analyser l'efficacité des réponses
- Améliorer les suggestions futures
- Personnaliser davantage l'expérience

## Troubleshooting

### L'IA ne répond pas
1. Vérifiez que le backend Django est lancé
2. Vérifiez la clé API Gemini dans `.env`
3. Consultez les logs du serveur Django

### Réponses génériques
- L'IA utilise le mode fallback (pas de clé API)
- Les réponses sont quand même contextuelles!

### Erreur "Failed to send message"
- Vérifiez l'authentification (token JWT)
- Vérifiez la connexion réseau
- Consultez la console du navigateur

## Roadmap

- [ ] Support de GPT-4 en alternative
- [ ] Streaming des réponses (temps réel)
- [ ] Actions automatiques (créer tâche, lancer focus, etc.)
- [ ] Apprentissage des préférences utilisateur
- [ ] Suggestions proactives
- [ ] Voice input/output
