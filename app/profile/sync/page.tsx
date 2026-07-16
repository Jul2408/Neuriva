'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calendar, Mail, RefreshCw, ChevronLeft, Check } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api/apiService';

export default function SyncPage() {
    const [integrations, setIntegrations] = useState({
        google_calendar: false,
        outlook_calendar: false
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const user = await apiService.getCurrentUser();
                if (user.preferences && user.preferences.integrations) {
                    setIntegrations(user.preferences.integrations);
                }
            } catch (error) {
                console.error("Failed to load integrations", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPreferences();
    }, []);

    const toggleIntegration = async (key: keyof typeof integrations) => {
        const newIntegrations = { ...integrations, [key]: !integrations[key] };
        setIntegrations(newIntegrations);

        try {
            const user = await apiService.getCurrentUser();
            const currentPreferences = user.preferences || {};
            await apiService.updateUser({
                preferences: {
                    ...currentPreferences,
                    integrations: newIntegrations
                }
            });
        } catch (error) {
            console.error("Failed to save integration state", error);
            setIntegrations(integrations); // Revert
        }
    };

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Retour au profil
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                        <RefreshCw className="w-8 h-8 text-primary-400" />
                        Synchronisation
                    </h1>
                    <p className="text-slate-400">Connectez vos outils externes</p>
                </div>

                <div className="space-y-4">
                    <Card className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="Google Calendar" className="w-8 h-8" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Google Calendar</h3>
                                <p className="text-sm text-slate-400">Synchronisez vos événements</p>
                            </div>
                        </div>
                        <Button
                            variant={integrations.google_calendar ? "primary" : "secondary"}
                            className={integrations.google_calendar ? "bg-green-600 hover:bg-green-700 border-none" : "border-primary-500/50 text-primary-400 hover:bg-primary-500/10"}
                            onClick={() => toggleIntegration('google_calendar')}
                        >
                            {integrations.google_calendar ? (
                                <div className="flex items-center gap-2">
                                    <Check className="w-4 h-4" /> Connecté
                                </div>
                            ) : "Connecter"}
                        </Button>
                    </Card>

                    <Card className="p-6 flex items-center justify-between opacity-75">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-[#0078D4] flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg">Outlook Calendar</h3>
                                <p className="text-sm text-slate-400">Bientôt disponible</p>
                            </div>
                        </div>
                        <Button variant="ghost" disabled>
                            Bientôt
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
