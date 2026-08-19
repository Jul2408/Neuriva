'use client';

import { useEffect, useRef } from 'react';
import { speakText } from '@/lib/speech';

export default function AudioNotificationHandler() {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Précharger l'audio personnalisé
        audioRef.current = new Audio('/notification.wav');
        audioRef.current.load();

        const handleServiceWorkerMessage = (event: MessageEvent) => {
            const { type, alarm } = event.data;

            if (type === 'ALARM_5MIN_WARNING' && alarm) {
                // Récupérer le prénom de l'utilisateur depuis le cache local
                let userName = '';
                try {
                    const userStr = localStorage.getItem('user');
                    if (userStr) {
                        const user = JSON.parse(userStr);
                        userName = user.first_name || user.username || '';
                    }
                } catch {}

                const greeting = userName ? `${userName}, ` : '';
                const textToSpeak = `${greeting}dans 5 minutes, c'est le début de ta tâche : ${alarm.title}. Prépare-toi !`;
                speakText(textToSpeak);
            }

            if (type === 'ALARM_NOW') {
                // Déclencher le son WAV
                if (audioRef.current) {
                    audioRef.current.currentTime = 0;
                    // Jouer le son et gérer l'erreur silencieusement si l'utilisateur n'a pas encore interagi
                    audioRef.current.play().catch(e => {
                        console.warn("Impossible de jouer le son (interaction utilisateur requise):", e);
                    });
                }
            }
        };

        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
        }

        return () => {
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
            }
        };
    }, []);

    return null; // Composant purement logique, aucun affichage
}
