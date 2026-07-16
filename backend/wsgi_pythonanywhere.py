"""
WSGI config for NEURIVA project on PythonAnywhere.
Remplacez 'VOTRE_USERNAME' par votre nom d'utilisateur PythonAnywhere.
"""

import os
import sys

# --- MODIFIEZ CETTE LIGNE ---
USERNAME = 'VOTRE_USERNAME'  # ex: 'jul2408'
# ----------------------------

path = f'/home/{USERNAME}/Neuriva/backend'
if path not in sys.path:
    sys.path.insert(0, path)

# Variables d'environnement de production
os.environ['DJANGO_SETTINGS_MODULE'] = 'neuriva.settings'
os.environ['DEBUG'] = 'False'
os.environ['SECRET_KEY'] = 'neuriva-super-secret-prod-key-changez-moi-2026'
os.environ['ALLOWED_HOSTS'] = f'{USERNAME}.pythonanywhere.com'
# Remplacez l'URL Vercel par la vôtre après déploiement
os.environ['CORS_ALLOWED_ORIGINS'] = 'https://neuriva.vercel.app,https://neuriva-jul2408.vercel.app'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
