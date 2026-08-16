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

    // Nettoyer le texte des caractères Markdown, emojis et symboles pour éviter que l'IA ne lise "astérisque" ou "visage souriant"
    const cleanText = text
        .replace(/[*_#~`]+/g, '') // Supprime les caractères spéciaux de formatage Markdown
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remplace les liens [texte](url) par "texte"
        .replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F1E6}-\u{1F1FF}\u{1F600}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, '') // Supprime les emojis
        .replace(/[^\w\s.,?!'-À-ÿ]/g, ' ') // Supprime les symboles mathématiques et ponctuations bizarres
        .replace(/\s+/g, ' ') // Nettoie les espaces multiples
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
        // Préférer une voix masculine (recherche très stricte)
        const maleKeywords = ['paul', 'thomas', 'henri', 'gaspard', 'rémi', 'claude', 'bernard', 'jacques', 'michel', 'david', 'male', 'homme', 'garçon'];
        
        // Sur Android Chrome, souvent les voix n'ont pas de noms descriptifs explicites, 
        // ou c'est "fr-fr-x-vlf-network". On va privilégier la première voix qui correspond
        // ou forcer le pitch à être légèrement plus grave pour simuler une voix d'homme.
        let preferredVoice = frenchVoices.find(v => 
            maleKeywords.some(keyword => v.name.toLowerCase().includes(keyword))
        );
        
        // Si on ne trouve pas de voix spécifiquement masculine, utiliser la première voix dispo
        if (!preferredVoice) {
            preferredVoice = frenchVoices[0];
            utterance.pitch = 0.8; // Baisse légèrement le pitch pour rendre la voix plus grave (masculine)
        }
        
        utterance.voice = preferredVoice;
    }

    window.speechSynthesis.speak(utterance);
};
