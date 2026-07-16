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

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configurer la langue et les options
    utterance.lang = lang;
    utterance.rate = 1.0; // Vitesse normale
    utterance.pitch = 1.0; // Tonalité normale
    utterance.volume = 1.0;

    // Essayer de trouver une voix française naturelle si possible
    const voices = window.speechSynthesis.getVoices();
    const frenchVoices = voices.filter(voice => voice.lang.startsWith('fr'));
    
    if (frenchVoices.length > 0) {
        // Préférer Google français ou Microsoft Hortense si dispo
        const preferredVoice = frenchVoices.find(v => v.name.includes('Google') || v.name.includes('Hortense')) || frenchVoices[0];
        utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
};
