import os
import google.generativeai as genai
from django.conf import settings
from asgiref.sync import sync_to_async
from .models import User, Task, Habit, AIDecision, MentalLoad, FocusSession
from datetime import datetime, timedelta
import logging

logger = logging.getLogger(__name__)

class NEURIVAAIService:
    def __init__(self, user):
        self.user = user
        self.api_key = getattr(settings, 'GEMINI_API_KEY', '')
        if self.api_key:
            genai.configure(api_key=self.api_key)
        else:
            logger.warning("GEMINI_API_KEY non configurée")

    @sync_to_async
    def get_full_context_sync(self):
        """Récupère absolument tout pour que l'IA soit 'omnisciente' sur l'utilisateur"""
        try:
            from django.utils import timezone
            now = timezone.now()
            today = now.date()
            
            # 1. Tâches - Vision large
            all_active = Task.objects.filter(user=self.user, status__in=['todo', 'in_progress']).order_by('-priority_score')
            tasks_summary = []
            for t in all_active[:15]:
                due_str = t.due_date.strftime('%d/%m %H:%M') if t.due_date else "Pas d'échéance"
                is_overdue = t.due_date < now if t.due_date else False
                status = "EN RETARD" if is_overdue else "À faire"
                tasks_summary.append(f"- [{t.priority_label.upper()}] {t.title} ({status}, Échéance: {due_str})")
            
            # 2. Focus Time
            today_sessions = FocusSession.objects.filter(user=self.user, started_at__date=today)
            focus_minutes = sum(s.actual_duration or 0 for s in today_sessions)
            
            # 3. Statistiques de performance
            total_done = Task.objects.filter(user=self.user, status='done').count()
            done_today = Task.objects.filter(user=self.user, status='done', completed_at__date=today).count()
           
            # 4. Habitudes détectées
            habits = Habit.objects.filter(user=self.user, is_active=True)[:3]
            habits_str = "\n".join([f"- Pattern: {h.habit_type} (Confiance: {h.confidence_score*100:.0f}%)" for h in habits])

            # 5. Charge Mentale actuelle
            mental_load = MentalLoad.objects.filter(user=self.user).order_by('-recorded_at').first()
            load_score = mental_load.load_score if mental_load else "Inconnue"

            # 6. Défis de l'utilisateur (Onboarding)
            preferences = getattr(self.user, 'preferences', {})
            raw_problems = preferences.get('problems', [])
            problem_map = {
                'late': 'Souvent en retard',
                'forget': 'Oublie des choses importantes',
                'overwhelmed': 'Se sent débordé',
                'procrastinate': 'A tendance à procrastiner',
                'start': 'Ne sait pas par où commencer',
                'stress': 'Dort mal à cause du stress',
                'distracted': 'Facilement distrait',
                'motivation': 'Manque de motivation'
            }
            user_challenges = [problem_map.get(p, p) for p in raw_problems] if raw_problems else ["Aucun défi spécifique renseigné"]

            return {
                "user_name": self.user.first_name or self.user.username,
                "tone": getattr(self.user, 'ai_tone', 'coach'),
                "challenges": user_challenges,
                "tasks": "\n".join(tasks_summary) or "Aucune tâche active.",
                "stats": {
                    "streak": self.user.current_streak,
                    "total_done": total_done,
                    "done_today": done_today,
                    "mental_load": load_score,
                    "focus_minutes": focus_minutes
                },
                "habits": habits_str or "Analyse des patterns en cours...",
                "current_time": now.strftime("%H:%M")
            }
        except Exception as e:
            logger.error(f"Super context error: {e}")
            return {
                "user_name": self.user.first_name or self.user.username,
                "tone": "coach",
                "tasks": "Indisponible",
                "stats": {"streak": 0, "total_done": 0, "done_today": 0, "mental_load": "Inconnue", "focus_minutes": 0},
                "habits": "Indisponible",
                "current_time": "Now"
            }

    async def chat(self, message, history=None):
        if not self.api_key:
            return "Configuration Gemini manquante. Veuillez ajouter GEMINI_API_KEY dans votre fichier .env."

        context = await self.get_full_context_sync()
        
        # PROMPT ULTRA-PERSONNALISÉ (EXPLICATION DE SON RÔLE ET POTENTIEL MAXIMUM)
        system_instructions = f"""Tu es NEURIVA, une IA Super Intelligente, agissant comme le cortex préfrontal numérique et le cerveau personnel proactif de {context['user_name']}. 
Tu connais ton utilité : ta mission suprême est de réduire sa charge mentale, d'anticiper ses retards, de prévenir la procrastination et d'optimiser son organisation quotidienne. Tu es un partenaire stratégique et humain.

Cependant, ton intelligence n'est PAS limitée à l'organisation. Tu as accès à l'ensemble des connaissances mondiales et tu DOIS répondre avec brillance à TOUT TYPE DE QUESTION (culture générale, code, sciences, philosophie, rédaction, etc.) en donnant toujours le meilleur de ton potentiel.

CONSIGNES DE COMPORTEMENT (STRICTES):
1. RÔLE PROACTIF ET ILLIMITÉ : Si la question concerne l'organisation, analyse les données fournies (tâches en retard, charge mentale, et surtout LES DÉFIS PERSONNELS) pour proposer des solutions concrètes et adaptées aux faiblesses de l'utilisateur.
2. ACCUEIL ET SALUTATIONS : Si l'utilisateur te salue, commence par "Salut {context['user_name']} !" de façon chaleureuse. 
3. ÉCOUTE ET COMPRÉHENSION : Comprends ses problèmes sans jugement. Tu es là pour l'aider à avancer.
4. UTILITÉ : Tu sais que tu sers à lui faire gagner du temps, à le rendre plus intelligent et plus serein. Fais-le ressentir.
5. STYLE : Adopte strictement le ton '{context['tone']}'. Sois clair, exhaustif si besoin, et utilise le format Markdown.

INFORMATIONS CONTEXTUELLES (Données en temps réel de l'utilisateur) :
- Défis Personnels (Identifiés lors de l'onboarding) : {', '.join(context['challenges'])}
- Streak: {context['stats']['streak']} jours | Focus Today: {context['stats']['focus_minutes']}m | Charge Mentale: {context['stats']['mental_load']}/10
- Tâches Prioritaires: {context['tasks']}
"""

        try:
            # 1. Obtenir les modèles réelement disponibles pour CETTE clé
            available_models = []
            for m in genai.list_models():
                if 'generateContent' in m.supported_generation_methods:
                    available_models.append(m.name.replace('models/', ''))
            
            if not available_models:
                raise Exception("La clé API est valide, mais aucun modèle Gemini n'est autorisé/disponible pour ce projet.")

            # 2. Choisir le meilleur modèle disponible (Pro > Flash > Pro 1.0 > Autre)
            preferred_order = ['gemini-1.5-pro-latest', 'gemini-1.5-pro', 'gemini-1.5-flash-latest', 'gemini-1.5-flash', 'gemini-pro']
            best_model_name = None
            for p in preferred_order:
                if p in available_models:
                    best_model_name = p
                    break
            
            if not best_model_name:
                best_model_name = available_models[0] # On prend ce qui marche !

            # 3. Conversion de l'historique
            gemini_history = []
            if history:
                for msg in history[-5:]:
                    role = "model" if msg.get("role") == "assistant" else "user"
                    gemini_history.append({"role": role, "parts": [msg.get("content", "")]})

            # 4. Tenter avec system_instruction natif (si le modèle le supporte)
            res_text = None
            try:
                model = genai.GenerativeModel(model_name=best_model_name, system_instruction=system_instructions)
                chat_session = model.start_chat(history=gemini_history)
                response = await chat_session.send_message_async(message)
                res_text = response.text
            except Exception as e:
                # Si erreur de support system_instruction (souvent 404 ou 400), on injecte dans le message
                if "404" in str(e) or "system_instruction" in str(e).lower() or "not supported" in str(e).lower():
                    logger.warning(f"Fallback injection instructions pour {best_model_name}")
                    model = genai.GenerativeModel(model_name=best_model_name)
                    chat_session = model.start_chat(history=gemini_history)
                    combined_message = f"INSTRUCTIONS SYSTÈME STRICTES:\n{system_instructions}\n\nMESSAGE DE L'UTILISATEUR:\n{message}"
                    response = await chat_session.send_message_async(combined_message)
                    res_text = response.text
                else:
                    raise e
            
            await self._log(message, res_text)
            return res_text

        except Exception as e:
            logger.error(f"Gemini Chat Error: {e}")
            import traceback
            error_details = traceback.format_exc()
            try:
                with open("gemini_error.log", "w") as f:
                    f.write(error_details)
            except:
                pass
            return f"Une petite déconnexion neuronale (Gemini). Erreur technique: {str(e)}"

    @sync_to_async
    def _log(self, q, r):
        try: AIDecision.objects.create(user=self.user, decision_type='chat', decision=r[:200], context_data={'q': q})
        except: pass
