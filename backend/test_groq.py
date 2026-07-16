import os
import asyncio
from dotenv import load_dotenv
from groq import AsyncGroq

load_dotenv()

async def test_groq():
    api_key = os.environ.get('GROQ_API_KEY')
    if not api_key:
        print("Erreur: GROQ_API_KEY introuvable dans le fichier .env")
        return

    print("Clé API trouvée. Test de connexion à Groq...")
    client = AsyncGroq(api_key=api_key)
    
    models_to_test = ["llama-3.3-70b-versatile", "llama-3.1-70b-versatile", "llama3-70b-8192", "llama-3.1-8b-instant"]
    
    for model in models_to_test:
        print(f"\n--- Test du modèle: {model} ---")
        try:
            response = await client.chat.completions.create(
                model=model,
                messages=[{"role": "user", "content": "Hello"}],
                max_tokens=10
            )
            print(f"Succès! Le modèle {model} fonctionne.")
            return model
        except Exception as e:
            print(f"Échec pour {model}: {e}")

if __name__ == "__main__":
    asyncio.run(test_groq())
