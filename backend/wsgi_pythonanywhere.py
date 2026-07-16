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

from decouple import config

# Variables d'environnement de production
os.environ['DJANGO_SETTINGS_MODULE'] = 'neuriva.settings'
# Let settings.py handle the actual reading of these if they are set in the environment,
# or we can just ensure they are loaded correctly. PythonAnywhere usually uses a .env file
# loaded by python-decouple in settings.py, so we don't need to hardcode them here.
# Just ensure DJANGO_SETTINGS_MODULE is set.

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
