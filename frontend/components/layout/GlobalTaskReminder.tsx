'use client';

import { useEffect, useRef } from 'react';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';

/**
 * GlobalTaskReminder
 * - Fonctionne en arrière-plan sur toutes les pages authentifiées
 * - Vérifie les tâches toutes les 60 secondes
 * - Envoie les alarmes au Service Worker pour qu'elles fonctionnent hors connexion
 * - Joue le son et affiche une notification système à l'échéance
 */
export default function GlobalTaskReminder() {
    const notified5MinRef = useRef<Set<string>>(new Set());
    const notifiedNowRef = useRef<Set<string>>(new Set());
    const swRegistrationRef = useRef<ServiceWorkerRegistration | null>(null);

    // ── Enregistrement du Service Worker d'alarmes ──────────────────────────
    useEffect(() => {
        if (!('serviceWorker' in navigator)) return;

        // Demander la permission de notifications au premier lancement
        if (typeof Notification !== 'undefined' && Notification.permission === 'default') {
            Notification.requestPermission().then((perm) => {
                if (perm === 'granted') {
                    toast.success('🔔 Notifications activées ! Vous recevrez des rappels pour vos tâches.');
                }
            });
        }

        // Enregistrer le SW d'alarmes
        navigator.serviceWorker
            .register('/sw-alarms.js', { scope: '/' })
            .then((reg) => {
                swRegistrationRef.current = reg;

                // Activer le Periodic Background Sync si disponible (Android Chrome)
                if ('periodicSync' in reg) {
                    (reg as any).periodicSync
                        .register('neuriva-alarm-check', { minInterval: 60 * 1000 })
                        .catch(() => {}); // Peut échouer si pas de permission
                }
            })
            .catch((err) => console.warn('[AlarmSW] Enregistrement échoué:', err));

        // Écouter les messages du SW
        const handleSWMessage = (event: MessageEvent) => {
            if (event.data?.type === 'CHECK_ALARMS') {
                checkTasksAndFireAlarms();
            }
        };
        navigator.serviceWorker.addEventListener('message', handleSWMessage);

        return () => {
            navigator.serviceWorker.removeEventListener('message', handleSWMessage);
        };
    }, []);

    // ── Vérification périodique des tâches ──────────────────────────────────
    useEffect(() => {
        checkTasksAndFireAlarms();
        const interval = setInterval(checkTasksAndFireAlarms, 60_000);
        return () => clearInterval(interval);
    }, []);

    const checkTasksAndFireAlarms = async () => {
        try {
            const response = await apiService.getTasks();
            const tasks = Array.isArray(response) ? response : (response.results || []);
            const now = new Date();

            // Préparer les alarmes pour le Service Worker
            const alarmsForSW: Array<{
                taskTitle: string;
                dueTs: number;
                notified5: boolean;
                notifiedNow: boolean;
            }> = [];

            for (const task of tasks) {
                if (!task.due_date || task.status === 'done' || task.status === 'cancelled') continue;

                const dueDate = new Date(task.due_date);
                const diffMs = dueDate.getTime() - now.getTime();
                const diffMin = Math.floor(diffMs / 60_000);

                alarmsForSW.push({
                    taskTitle: task.title,
                    dueTs: dueDate.getTime(),
                    notified5: notified5MinRef.current.has(task.id),
                    notifiedNow: notifiedNowRef.current.has(task.id),
                });

                // Rappel 5 minutes avant
                if (diffMin <= 5 && diffMin > 0 && !notified5MinRef.current.has(task.id)) {
                    notified5MinRef.current.add(task.id);
                    toast.info(`⏰ Dans 5 min : "${task.title}"`, { duration: 8000 });
                    fireNotification(
                        `⏰ Dans 5 min : ${task.title}`,
                        'Préparez-vous à commencer cette tâche !',
                        `alarm-5min-${task.id}`
                    );
                }

                // Rappel à l'heure exacte
                if (diffMin <= 0 && diffMin > -5 && !notifiedNowRef.current.has(task.id)) {
                    notifiedNowRef.current.add(task.id);
                    toast.success(`🚀 C'est l'heure ! "${task.title}"`, { duration: 12000 });
                    fireNotification(
                        `🚀 C'est l'heure ! ${task.title}`,
                        "Il est temps de commencer. Bonne concentration !",
                        `alarm-now-${task.id}`
                    );
                    playAlarmSound();
                }
            }

            // Envoyer les alarmes au Service Worker pour qu'il gère l'offline
            if (swRegistrationRef.current?.active && alarmsForSW.length > 0) {
                swRegistrationRef.current.active.postMessage({
                    type: 'SCHEDULE_ALARM',
                    payload: { alarms: alarmsForSW },
                });
            }

        } catch (err) {
            // Silencieux si hors ligne — le SW prend le relais
        }
    };

    const fireNotification = (title: string, body: string, tag: string) => {
        if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return;

        const sw = swRegistrationRef.current;
        if (sw) {
            sw.showNotification(title, {
                body,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                tag,
                renotify: true,
                vibrate: [200, 100, 200, 100, 400],
                actions: [
                    { action: 'open', title: 'Voir la tâche' },
                    { action: 'dismiss', title: 'Ignorer' },
                ],
                data: { url: '/tasks' },
            } as any);
        } else {
            // Fallback si le SW n'est pas disponible
            new Notification(title, { body, icon: '/icon-192x192.png', tag });
        }
    };

    const playAlarmSound = () => {
        try {
            const audio = new Audio('/notification.wav');
            audio.volume = 0.8;
            audio.play().catch(() => {}); // Peut échouer si pas d'interaction utilisateur
        } catch {}
    };

    return null; // Composant invisible
}
