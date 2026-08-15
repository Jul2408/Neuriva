/**
 * Utilitaire pour la synthèse vocale (Text-to-Speech)
 * Utilise window.speechSynthesis
 */

export const speakText = (text: string, lang: string = 'fr-FR') => {
    if (!('speechSynthesis' in window)) {
        console.warn("La synthèse vocale n'est pas supportée sur ce navigateur.");
        return;
    }

    // Arrêter toute lecture en cours
    window.speechSynthesis.cancel();

    // Nettoyer le texte des caractères Markdown pour éviter que l'IA ne lise "astérisque"
    const cleanText = text
        .replace(/[*_#~`]+/g, '') // Supprime les caractères spéciaux de formatage Markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remplace les liens [texte](url) par "texte"
        .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configurer la langue et les options
    utterance.lang = lang;
    utterance.rate = 1.0; // Vitesse normale
    utterance.pitch = 1.0; // Tonalité normale
    utterance.volume = 1.0;

    // Essayer de trouver une voix française naturelle si possible
    const voices = window.speechSynthesis.getVoices();
    const frenchVoices = voices.filter(voice => voice.lang.startsWith('fr'));
    
    if (frenchVoices.length > 0) {
        // Préférer une voix masculine
        const maleKeywords = ['paul', 'thomas', 'henri', 'gaspard', 'rémi', 'claude', 'bernard', 'jacques', 'michel', 'david', 'male', 'homme', 'garçon'];
        
        let preferredVoice = frenchVoices.find(v => 
            maleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
        );
        
        // Si on ne trouve pas de voix spécifiquement masculine, utiliser la première voix dispo
        if (!preferredVoice) {
            preferredVoice = frenchVoices[0];
        }
        
        utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
};
