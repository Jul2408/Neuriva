/**
 * NEURIVA Offline Alarm Service Worker v2
 * Gère les alarmes de tâches même quand l'app est fermée ou hors connexion.
 * Les alarmes sont stockées dans la Cache API (persistant même sans réseau).
 */

const ALARM_CACHE = 'neuriva-alarms-v2';
const ALARM_CACHE_KEY = '/alarms-data';
const CHECK_INTERVAL_MS = 60 * 1000; // Vérifie toutes les 60 secondes

// ─── Installation / Activation ───────────────────────────────────────────────

self.addEventListener('install', () => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        Promise.all([
            clients.claim(),
            // Nettoyer les anciens caches d'alarmes
            caches.keys().then(keys =>
                Promise.all(keys.filter(k => k.startsWith('neuriva-alarms-') && k !== ALARM_CACHE).map(k => caches.delete(k)))
            ),
        ])
    );
    startAlarmLoop();
});

// ─── Timer d'alarmes ─────────────────────────────────────────────────────────

let alarmTimer = null;

function startAlarmLoop() {
    if (alarmTimer) clearInterval(alarmTimer);
    alarmTimer = setInterval(checkAlarms, CHECK_INTERVAL_MS);
    checkAlarms(); // Vérifier immédiatement
}

async function checkAlarms() {
    try {
        const alarms = await loadAlarmsFromCache();
        if (!alarms || alarms.length === 0) return;

        const now = Date.now();
        let changed = false;

        for (const alarm of alarms) {
            if (alarm.notifiedNow) continue;

            const diffMs = alarm.dueTs - now;
            const diffMin = Math.floor(diffMs / 60000);

            // Notification 5 minutes avant
            if (diffMin <= 5 && diffMin > 0 && !alarm.notified5) {
                await showNotification({
                    title: `⏰ Dans 5 min : ${alarm.title}`,
                    body: 'Préparez-vous à commencer cette tâche !',
                    tag: `alarm-5min-${alarm.title}`,
                    url: '/tasks',
                });
                
                // Broadcast pour l'IA Vocale
                const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
                clientList.forEach(c => c.postMessage({ type: 'ALARM_5MIN_WARNING', alarm }));
                
                alarm.notified5 = true;
                changed = true;
            }

            // Notification à l'heure exacte (fenêtre de 10 min)
            if (diffMin <= 0 && diffMin > -10 && !alarm.notifiedNow) {
                await showNotification({
                    title: `🚀 C'est l'heure ! ${alarm.title}`,
                    body: "Il est temps de commencer cette tâche.",
                    tag: `alarm-now-${alarm.title}`,
                    url: '/tasks',
                });
                
                // Broadcast pour le fichier son personnalisé
                const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
                clientList.forEach(c => c.postMessage({ type: 'ALARM_NOW', alarm }));
                
                alarm.notifiedNow = true;
                changed = true;
            }
        }

        if (changed) {
            await saveAlarmsToCache(alarms);
            // Notifier les clients ouverts de mettre à jour leur état local
            const clientList = await clients.matchAll({ type: 'window', includeUncontrolled: true });
            clientList.forEach(c => c.postMessage({ type: 'ALARMS_UPDATED', alarms }));
        }
    } catch (e) {
        console.error('[SW Alarm] Erreur checkAlarms:', e);
    }
}

// ─── Messages depuis l'app ───────────────────────────────────────────────────

self.addEventListener('message', async (event) => {
    const { type, payload } = event.data || {};

    switch (type) {
        case 'SCHEDULE_ALARM': {
            // Ajouter ou mettre à jour des alarmes
            const existing = (await loadAlarmsFromCache()) || [];
            const newAlarms = payload.alarms || [];

            // Fusionner : on évite les doublons par titre+dueTs
            for (const na of newAlarms) {
                const idx = existing.findIndex(e => e.title === na.title && e.dueTs === na.dueTs);
                if (idx === -1) existing.push(na);
                else existing[idx] = { ...existing[idx], ...na };
            }

            await saveAlarmsToCache(existing);
            // Confirmer à l'émetteur
            if (event.source) event.source.postMessage({ type: 'ALARM_SCHEDULED_OK' });
            break;
        }

        case 'CLEAR_ALARM': {
            const alarms = (await loadAlarmsFromCache()) || [];
            const filtered = alarms.filter(a => !(a.title === payload.title && a.dueTs === payload.dueTs));
            await saveAlarmsToCache(filtered);
            break;
        }

        case 'GET_ALARMS': {
            const alarms = (await loadAlarmsFromCache()) || [];
            if (event.source) event.source.postMessage({ type: 'ALARMS_DATA', alarms });
            break;
        }

        case 'CHECK_ALARMS':
            await checkAlarms();
            break;

        case 'FIRE_ALARM':
            // L'app nous demande directement d'afficher une notification
            await showNotification(payload);
            break;
    }
});

// ─── Periodic Background Sync (Android Chrome) ───────────────────────────────

self.addEventListener('periodicsync', (event) => {
    if (event.tag === 'neuriva-alarm-check') {
        event.waitUntil(checkAlarms());
    }
});

// ─── Affichage de notification ────────────────────────────────────────────────

async function showNotification({ title, body, tag, url }) {
    if (!self.registration) return;

    try {
        await self.registration.showNotification(title, {
            body: body || '',
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: tag || 'neuriva-alarm',
            renotify: true,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 400],
            silent: false, // Force le son du système si l'app est fermée
            actions: [
                { action: 'open', title: '📋 Ouvrir NEURIVA' },
                { action: 'dismiss', title: '✖ Ignorer' },
            ],
            data: { url: url || '/tasks' },
        });
    } catch (e) {
        console.error('[SW] Erreur showNotification:', e);
    }
}

// ─── Cache API : lecture/écriture des alarmes ─────────────────────────────────

async function loadAlarmsFromCache() {
    try {
        const cache = await caches.open(ALARM_CACHE);
        const response = await cache.match(ALARM_CACHE_KEY);
        if (!response) return [];
        return await response.json();
    } catch (e) {
        console.error('[SW] Erreur loadAlarmsFromCache:', e);
        return [];
    }
}

async function saveAlarmsToCache(alarms) {
    try {
        const cache = await caches.open(ALARM_CACHE);
        await cache.put(
            ALARM_CACHE_KEY,
            new Response(JSON.stringify(alarms), {
                headers: { 'Content-Type': 'application/json' },
            })
        );
    } catch (e) {
        console.error('[SW] Erreur saveAlarmsToCache:', e);
    }
}

// ─── Clic sur la notification ─────────────────────────────────────────────────

self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'dismiss') return;

    const url = event.notification.data?.url || '/tasks';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Si l'app est déjà ouverte, la mettre en avant
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    if ('navigate' in client) client.navigate(url);
                    return;
                }
            }
            // Sinon ouvrir une nouvelle fenêtre
            if (clients.openWindow) {
                return clients.openWindow(url);
            }
        })
    );
});
