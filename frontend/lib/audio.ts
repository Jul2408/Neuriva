/**
 * Utilitaire pour jouer des sons d'alerte sans nécessiter de fichiers audio externes.
 * Utilise l'API Web Audio pour générer des fréquences (bip/sonnerie).
 */

let audioContext: AudioContext | null = null;

export const playNotificationSound = (type: 'default' | 'focus-start' | 'focus-end' = 'default') => {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }

        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }

        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        const now = audioContext.currentTime;

        if (type === 'focus-start') {
            // Son ascendant et motivant pour le début
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(440, now); // A4
            oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.3); // Monte à A5
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.4, now + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.0);
            
            oscillator.start(now);
            oscillator.stop(now + 1.0);
            
        } else if (type === 'focus-end') {
            // Son descendant, apaisant pour la fin (type bol tibétain)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, now); // C5
            oscillator.frequency.exponentialRampToValueAtTime(261.63, now + 2.0); // Descend à C4
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.5, now + 0.5); // Attaque lente
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 3.0); // Déclin très lent
            
            oscillator.start(now);
            oscillator.stop(now + 3.0);
            
        } else {
            // Son par défaut (ding)
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, now); // A5
            oscillator.frequency.exponentialRampToValueAtTime(1760, now + 0.1); // A6
            
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + 0.02);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
            
            oscillator.start(now);
            oscillator.stop(now + 0.8);
        }

    } catch (error) {
        console.error("Erreur lors de la lecture du son :", error);
    }
};
