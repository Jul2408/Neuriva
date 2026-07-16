/**
 * Utilitaire pour jouer des sons d'alerte sans nécessiter de fichiers audio externes.
 * Utilise l'API Web Audio pour générer des fréquences (bip/sonnerie).
 */

let audioContext: AudioContext | null = null;

export const playNotificationSound = () => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        // Type de son : onde sinusoïdale pour un son doux (type clochette/ding)
        oscillator.type = 'sine';
        
        // Fréquence (Note de musique)
        oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
        oscillator.frequency.exponentialRampToValueAtTime(1760, audioContext.currentTime + 0.1); // A6 (ding ascendant)

        // Enveloppe du volume (Attaque rapide, déclin progressif)
        gainNode.gain.setValueAtTime(0, audioContext.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.8);

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.start();
        oscillator.stop(audioContext.currentTime + 0.8);
    } catch (error) {
        console.error("Erreur lors de la lecture du son :", error);
    }
};
