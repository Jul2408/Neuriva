/**
 * Utilitaire pour les notifications système du navigateur/téléphone
 */

export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.warn("Ce navigateur ne supporte pas les notifications système.");
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    }

    return false;
};

export const sendSystemNotification = (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
        return;
    }

    if (Notification.permission === 'granted') {
        try {
            // Utiliser le Service Worker s'il est dispo, sinon fallback sur new Notification()
            navigator.serviceWorker?.getRegistration().then(registration => {
                if (registration) {
                    registration.showNotification(title, {
                        icon: '/favicon.ico',
                        badge: '/favicon.ico',
                        ...options
                    });
                } else {
                    new Notification(title, {
                        icon: '/favicon.ico',
                        ...options
                    });
                }
            }).catch(() => {
                new Notification(title, {
                    icon: '/favicon.ico',
                    ...options
                });
            });
        } catch (e) {
            console.error("Erreur d'envoi de notification", e);
        }
    }
};
