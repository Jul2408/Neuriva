from google import genai
from google.genai import types
from django.conf import settings
from asgiref.sync import sync_to_async
from .models import User, Task, Habit, AIDecision, MentalLoad, FocusSession
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

# ─── Cache global du meilleur modèle disponible ──────────────────────────────
_cached_model_name: str | None = None


def _pick_best_model() -> str:
    """Sélectionne et met en cache le meilleur modèle Gemini disponible."""
    global _cached_model_name
    if _cached_model_name:
        return _cached_model_name
    _cached_model_name = 'gemini-2.5-flash'
    return _cached_model_name


def _make_part(text: str) -> types.Part:
    """Crée un Part compatible avec toutes les versions du SDK google-genai."""
    try:
        return types.Part(text=text)
    except Exception:
        return types.Part.from_text(text=text)


class NEURIVAAIService:
    def __init__(self, user):
        self.user = user
        self.api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if self.api_key:
            self.client = genai.Client(api_key=self.api_key)
        else:
            self.client = None
            logger.warning("GEMINI_API_KEY non configurée dans les paramètres Django")

    @sync_to_async
    def get_full_context_sync(self):
        """Récupère le contexte complet de l'utilisateur pour personnaliser les réponses de l'IA."""
        try:
            from django.utils import timezone
            now = timezone.now()
            today = now.date()

            all_active = Task.objects.filter(
                user=self.user, status__in=['todo', 'in_progress']
            ).order_by('-priority_score')
            tasks_summary = []
            for t in all_active[:15]:
                due_str = t.due_date.strftime('%d/%m %H:%M') if t.due_date else "Pas d'échéance"
                is_overdue = t.due_date < now if t.due_date else False
                status_label = "EN RETARD" if is_overdue else "A faire"
                tasks_summary.append(
                    f"- [{t.priority_label.upper()}] {t.title} ({status_label}, Echeance: {due_str})"
                )

            today_sessions = FocusSession.objects.filter(user=self.user, started_at__date=today)
            focus_minutes = sum(s.actual_duration or 0 for s in today_sessions)

            total_done = Task.objects.filter(user=self.user, status='done').count()
            done_today = Task.objects.filter(
                user=self.user, status='done', completed_at__date=today
            ).count()

            habits = Habit.objects.filter(user=self.user, is_active=True)[:3]
            habits_str = "\n".join([
                f"- Pattern: {h.habit_type} (Confiance: {h.confidence_score * 100:.0f}%)"
                for h in habits
            ])

            mental_load = MentalLoad.objects.filter(user=self.user).order_by('-recorded_at').first()
            load_score = mental_load.load_score if mental_load else "Inconnue"

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
            return "Configuration Gemini manquante. Veuillez ajouter GEMINI_API_KEY dans votre fichier .env."

        context = await self.get_full_context_sync()

        tone_descriptions = {
            'robot': "précis, factuel et ultra-structuré, sans fioritures émotionnelles — comme un assistant professionnel",
            'coach': "bienveillant, direct et motivant — comme un coach de vie qui croit en toi",
            'zen': "calme, posé et inspirant — favorisant la clarté mentale et la sérénité",
        }
        tone_desc = tone_descriptions.get(context['tone'], tone_descriptions['coach'])
        premium_note = "Cet utilisateur est un membre Premium NEURIVA." if context.get('is_premium') else ""

        system_instructions = f"""Tu es **NEURIVA**, le cerveau exécutif numérique de {context['user_name']}. {premium_note}

**Mission principale** : Réduire sa charge mentale, anticiper les retards, prévenir la procrastination et optimiser son organisation au quotidien. Tu réponds aussi brillamment à TOUTE question (code, sciences, culture, rédaction, etc.).

**Style de communication** :
- **Langue** : Tu dois parler UNIQUEMENT et STRICTEMENT en français. Aucune autre langue n'est autorisée.
- **Ton** : Ton "{context['tone']}" → {tone_desc}. Reste humain, simple, et va droit au but.
- **Format** : Utilise le Markdown proprement (titres, listes, gras).
**ATTENTION STRICTE** : Interdiction formelle et absolue d'utiliser le moindre emoji. Ton texte doit être pur et sérieux.

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
1. N'UTILISE STRICTEMENT AUCUN EMOJI.
2. Si l'utilisateur salue → réponds chaleureusement "Salut {context['user_name']} !" puis propose une aide concrète.
3. Si des tâches sont EN RETARD → mentionne-les proactivement avec une suggestion d'action immédiate.
4. Ne jamais inventer de données.
5. Pour toute analyse de tâches → propose toujours une action concrète et prioritaire.
6. Tu peux créer des tâches. Dès que l'utilisateur te demande de retenir quelque chose, UTILISE L'OUTIL `create_task`."""

        try:
            model_name = _pick_best_model()

            gemini_history = []
            if history:
                for msg in history[-12:]:
                    role = "user" if msg.get("role") == "user" else "model"
                    gemini_history.append(
                        types.Content(role=role, parts=[_make_part(msg.get("content", ""))])
                    )

            def create_task(title: str, estimated_duration: int = 15) -> str:
                """Crée une nouvelle tâche pour l'utilisateur dans NEURIVA.

                Args:
                    title: Le titre descriptif de la tâche.
                    estimated_duration: Durée estimée en minutes (défaut 15).
                """
                try:
                    task = Task.objects.create(
                        user=self.user,
                        title=title[:200],
                        estimated_duration=estimated_duration,
                        status='todo'
                    )
                    return f"Tâche '{title}' créée avec succès (ID: {task.id})."
                except Exception as e:
                    return f"Erreur lors de la création de la tâche: {str(e)}"

            try:
                config = types.GenerateContentConfig(
                    system_instruction=system_instructions,
                    tools=[create_task]
                )

                gemini_history.append(
                    types.Content(role="user", parts=[_make_part(message)])
                )

                response = await sync_to_async(self.client.models.generate_content)(
                    model=model_name,
                    contents=gemini_history,
                    config=config
                )

                res_text = response.text

            except Exception as inner_e:
                err_str = str(inner_e)
                if "429" in err_str or "quota" in err_str.lower() or "rate" in err_str.lower():
                    return "Le quota Gemini est temporairement atteint. Reessayez dans quelques secondes."
                raise inner_e

            await self._log(message, res_text)
            return res_text

        except Exception as e:
            logger.error(f"Erreur Gemini Chat : {e}")
            import traceback
            traceback.print_exc()
            return f"Une erreur technique est survenue avec l'IA. Details : {str(e)}"

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
