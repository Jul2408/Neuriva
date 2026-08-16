import google.generativeai as genai
from django.conf import settings
from asgiref.sync import sync_to_async
from .models import User, Task, Habit, AIDecision, MentalLoad, FocusSession
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# ─── Cache global du meilleur modèle disponible ──────────────────────────────
# Évite un appel réseau list_models() à chaque message envoyé par l'utilisateur.
_cached_model_name: str | None = None


def _pick_best_model() -> str:
    """Sélectionne et met en cache le meilleur modèle Gemini disponible."""
    global _cached_model_name
    if _cached_model_name:
        return _cached_model_name

    # Ordre de préférence : 2.0 Flash (ultra-rapide) → 1.5 Pro (qualité) → fallback
    preferred_order = [
        'gemini-2.0-flash',
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro-latest',
        'gemini-1.5-pro',
        'gemini-1.5-flash-latest',
        'gemini-1.5-flash',
        'gemini-pro',
    ]

    try:
        available = {
            m.name.replace('models/', '')
            for m in genai.list_models()
            if 'generateContent' in m.supported_generation_methods
        }
        for candidate in preferred_order:
            if candidate in available:
                _cached_model_name = candidate
                logger.info(f"Modèle Gemini sélectionné et mis en cache : {candidate}")
                return candidate
        if available:
            _cached_model_name = list(available)[0]
            logger.warning(f"Aucun modèle préféré trouvé, fallback vers : {_cached_model_name}")
            return _cached_model_name
    except Exception as e:
        logger.error(f"Impossible de lister les modèles Gemini : {e}")

    # Dernier recours absolu si list_models() échoue
    _cached_model_name = 'gemini-1.5-flash'
    return _cached_model_name


class NEURIVAAIService:
    def __init__(self, user):
        self.user = user
        self.api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            logger.warning("GEMINI_API_KEY non configurée dans les paramètres Django")

    @sync_to_async
    def get_full_context_sync(self):
        """Récupère le contexte complet de l'utilisateur pour personnaliser les réponses de l'IA."""
        try:
            from django.utils import timezone
            now = timezone.now()
            today = now.date()

            # 1. Tâches actives avec statut retard
            all_active = Task.objects.filter(
                user=self.user, status__in=['todo', 'in_progress']
            ).order_by('-priority_score')
            tasks_summary = []
            for t in all_active[:15]:
                due_str = t.due_date.strftime('%d/%m %H:%M') if t.due_date else "Pas d'échéance"
                is_overdue = t.due_date < now if t.due_date else False
                status_label = "⚠️ EN RETARD" if is_overdue else "À faire"
                tasks_summary.append(
                    f"- [{t.priority_label.upper()}] {t.title} ({status_label}, Échéance: {due_str})"
                )

            # 2. Sessions de focus aujourd'hui
            today_sessions = FocusSession.objects.filter(user=self.user, started_at__date=today)
            focus_minutes = sum(s.actual_duration or 0 for s in today_sessions)

            # 3. Statistiques de performance
            total_done = Task.objects.filter(user=self.user, status='done').count()
            done_today = Task.objects.filter(
                user=self.user, status='done', completed_at__date=today
            ).count()

            # 4. Habitudes détectées automatiquement
            habits = Habit.objects.filter(user=self.user, is_active=True)[:3]
            habits_str = "\n".join([
                f"- Pattern: {h.habit_type} (Confiance: {h.confidence_score * 100:.0f}%)"
                for h in habits
            ])

            # 5. Charge mentale actuelle
            mental_load = MentalLoad.objects.filter(user=self.user).order_by('-recorded_at').first()
            load_score = mental_load.load_score if mental_load else "Inconnue"

            # 6. Défis personnels identifiés lors de l'onboarding
            preferences = getattr(self.user, 'preferences', {}) or {}
            raw_problems = preferences.get('problems', [])
            problem_map = {
                'late': 'Souvent en retard',
                'forget': 'Oublie des choses importantes',
                'overwhelmed': 'Se sent débordé',
                'procrastinate': 'A tendance à procrastiner',
                'start': 'Ne sait pas par où commencer',
                'stress': 'Dort mal à cause du stress',
                'distracted': 'Facilement distrait',
                'motivation': 'Manque de motivation',
            }
            user_challenges = (
                [problem_map.get(p, p) for p in raw_problems]
                if raw_problems
                else ["Aucun défi spécifique renseigné"]
            )

            return {
                "user_name": self.user.first_name or self.user.username,
                "tone": getattr(self.user, 'ai_tone', 'coach'),
                "is_premium": getattr(self.user, 'is_premium', False),
                "challenges": user_challenges,
                "tasks": "\n".join(tasks_summary) or "Aucune tâche active.",
                "stats": {
                    "streak": self.user.current_streak,
                    "total_done": total_done,
                    "done_today": done_today,
                    "mental_load": load_score,
                    "focus_minutes": focus_minutes,
                },
                "habits": habits_str or "Analyse des patterns comportementaux en cours...",
                "current_time": now.strftime("%H:%M"),
                "current_date": now.strftime("%A %d %B %Y"),
            }
        except Exception as e:
            logger.error(f"Erreur lors de la récupération du contexte utilisateur : {e}")
            return {
                "user_name": self.user.first_name or self.user.username,
                "tone": "coach",
                "is_premium": False,
                "challenges": ["Indisponible"],
                "tasks": "Indisponible",
                "stats": {
                    "streak": 0, "total_done": 0, "done_today": 0,
                    "mental_load": "Inconnue", "focus_minutes": 0,
                },
                "habits": "Indisponible",
                "current_time": datetime.now().strftime("%H:%M"),
                "current_date": datetime.now().strftime("%A %d %B %Y"),
            }

    async def chat(self, message: str, history: list | None = None) -> str:
        if not self.api_key:
            return "⚠️ Configuration Gemini manquante. Veuillez ajouter `GEMINI_API_KEY` dans votre fichier `.env`."

        context = await self.get_full_context_sync()

        tone_descriptions = {
            'robot': "précis, factuel et ultra-structuré, sans fioritures émotionnelles — comme un assistant professionnel",
            'coach': "bienveillant, direct et motivant — comme un coach de vie qui croit en toi",
            'zen': "calme, posé et inspirant — favorisant la clarté mentale et la sérénité",
        }
        tone_desc = tone_descriptions.get(context['tone'], tone_descriptions['coach'])
        premium_note = "🌟 Cet utilisateur est un membre **Premium NEURIVA**." if context.get('is_premium') else ""

        system_instructions = f"""Tu es **NEURIVA**, le cerveau exécutif numérique de {context['user_name']}. {premium_note}

**Mission principale** : Réduire sa charge mentale, anticiper les retards, prévenir la procrastination et optimiser son organisation au quotidien. Tu réponds aussi brillamment à TOUTE question (code, sciences, culture, rédaction, etc.).

**Style de communication** : Ton "{context['tone']}" → {tone_desc}. Utilise le Markdown proprement (titres, listes, gras). Sois concis mais complet. Évite les réponses vagues.
**ATTENTION STRICTE** : Tu dois rester 100% humain et professionnel. Tu as une interdiction formelle et absolue d'utiliser le moindre emoji (aucun smiley, aucun symbole Unicode illustratif). Ton texte doit être pur et sérieux.

---

**CONTEXTE EN TEMPS RÉEL** ({context['current_date']} à {context['current_time']}) :
- **Défis personnels** : {', '.join(context['challenges'])}
- **Streak** : {context['stats']['streak']} jours consécutifs
- **Focus aujourd'hui** : {context['stats']['focus_minutes']} min
- **Tâches complétées aujourd'hui** : {context['stats']['done_today']}
- **Charge mentale** : {context['stats']['mental_load']}/10
- **Habitudes détectées** : {context['habits']}

**Tâches actives :**
{context['tasks']}

---

**RÈGLES ABSOLUES** :
1. N'UTILISE STRICTEMENT AUCUN EMOJI. C'est une règle vitale.
2. Si l'utilisateur salue → réponds chaleureusement "Salut {context['user_name']} !" puis propose une aide concrète basée sur son contexte actuel.
3. Si des tâches sont EN RETARD → mentionne-les proactivement avec une suggestion d'action immédiate.
4. Ne jamais inventer de données. Si tu ne sais pas, dis-le honnêtement.
5. Pour toute analyse de tâches → propose toujours une action concrète et prioritaire."""

        try:
            model_name = _pick_best_model()

            # Fenêtre d'historique étendue à 12 messages (6 échanges) pour plus de cohérence
            gemini_history = []
            if history:
                for msg in history[-12:]:
                    role = "model" if msg.get("role") == "assistant" else "user"
                    gemini_history.append({"role": role, "parts": [msg.get("content", "")]})

            # Tentative avec system_instruction natif (supporté par tous les modèles 1.5+)
            res_text = None
            try:
                model = genai.GenerativeModel(
                    model_name=model_name,
                    system_instruction=system_instructions
                )
                chat_session = model.start_chat(history=gemini_history)
                response = await chat_session.send_message_async(message)
                res_text = response.text

            except Exception as inner_e:
                err_str = str(inner_e)

                if "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
                    return "⏳ Le quota Gemini est temporairement atteint. Réessayez dans quelques secondes."

                elif any(kw in err_str for kw in ["404", "system_instruction", "not supported", "invalid"]):
                    # Fallback : injection manuelle du prompt système dans le message
                    logger.warning(f"Fallback injection de prompt système pour {model_name} : {inner_e}")
                    model = genai.GenerativeModel(model_name=model_name)
                    chat_session = model.start_chat(history=gemini_history)
                    combined = f"INSTRUCTIONS SYSTÈME:\n{system_instructions}\n\nMESSAGE:\n{message}"
                    response = await chat_session.send_message_async(combined)
                    res_text = response.text

                else:
                    raise inner_e

            await self._log(message, res_text)
            return res_text

        except Exception as e:
            logger.error(f"Erreur Gemini Chat : {e}")
            import traceback
            traceback.print_exc()
            return f"❌ Une erreur technique est survenue avec l'IA. Détails : {str(e)}"

    @sync_to_async
    def _log(self, q: str, r: str):
        """Sauvegarde la décision IA pour l'historique et l'analyse."""
        try:
            AIDecision.objects.create(
                user=self.user,
                decision_type='chat',
                decision=r[:200],
                context_data={'question': q[:500]},
                reasoning="Chat IA NEURIVA"
            )
        except Exception:
            pass
