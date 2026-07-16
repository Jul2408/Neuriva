'use client';

import { Card } from '@/components/ui/Card';
import { Switch } from '@/components/ui/Switch';
import { Bell, Mail, MessageSquare, ChevronLeft, Smartphone } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api/apiService';

export default function NotificationsPage() {
    const [preferences, setPreferences] = useState({
        email_digest: true,
        email_updates: false,
        push_tasks: true,
        push_reminders: true,
        in_app_mentions: true
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadPreferences = async () => {
            try {
                const user = await apiService.getCurrentUser();
                if (user.notification_settings) {
                    setPreferences(prev => ({ ...prev, ...user.notification_settings }));
                }
            } catch (error) {
                console.error("Failed to load settings", error);
            } finally {
                setIsLoading(false);
            }
        };
        loadPreferences();
    }, []);

    const toggle = async (key: keyof typeof preferences) => {
        const newPreferences = { ...preferences, [key]: !preferences[key] };
        setPreferences(newPreferences);
        try {
            await apiService.updateUser({ notification_settings: newPreferences });
        } catch (error) {
            console.error("Failed to save settings", error);
            // Revert on error
            setPreferences({ ...preferences });
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
                        <Bell className="w-8 h-8 text-primary-400" />
                        Notifications
                    </h1>
                    <p className="text-slate-400">Choisissez comment et quand nous vous contactons</p>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Mail className="w-5 h-5 text-blue-400" />
                            <h3 className="text-lg font-bold">Email</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Résumé quotidien</p>
                                    <p className="text-sm text-slate-400">Vos tâches et stats chaque matin</p>
                                </div>
                                <Switch
                                    checked={preferences.email_digest}
                                    onCheckedChange={() => toggle('email_digest')}
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Nouveautés produits</p>
                                    <p className="text-sm text-slate-400">Mises à jour et nouvelles fonctionnalités</p>
                                </div>
                                <Switch
                                    checked={preferences.email_updates}
                                    onCheckedChange={() => toggle('email_updates')}
                                />
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Smartphone className="w-5 h-5 text-purple-400" />
                            <h3 className="text-lg font-bold">Mobile & Push</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Rappels de tâches</p>
                                    <p className="text-sm text-slate-400">Quand une tâche arrive à échéance</p>
                                </div>
                                <Switch
                                    checked={preferences.push_reminders}
                                    onCheckedChange={() => toggle('push_reminders')}
                                />
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
