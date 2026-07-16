'use client';

import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Switch'; // Assuming Switch component or using simple toggle logic
import { Bell, Moon, Sun, Monitor, ChevronLeft, Volume2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

export default function PreferencesPage() {
    const [notifications, setNotifications] = useState(true);
    const [sound, setSound] = useState(false);

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Retour au profil
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2">Préférences</h1>
                    <p className="text-slate-400">Personnalisez votre expérience NEURIVA</p>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-primary-400" /> Notifications
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-medium">Notifications Push</p>
                                    <p className="text-sm text-slate-400">Recevoir des rappels sur votre navigateur</p>
                                </div>
                                <div
                                    className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-primary-500' : 'bg-slate-700'}`}
                                    onClick={() => setNotifications(!notifications)}
                                >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${notifications ? 'translate-x-6' : 'translate-x-0'}`} />
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Monitor className="w-5 h-5 text-purple-400" /> Apparence
                        </h3>
                        <div className="grid grid-cols-3 gap-3">
                            <button className="p-4 rounded-xl bg-primary-500/20 border border-primary-500 flex flex-col items-center gap-2">
                                <Moon className="w-6 h-6 text-white" />
                                <span className="text-sm font-medium">Sombre</span>
                            </button>
                            <button className="p-4 rounded-xl bg-slate-800 border border-transparent opacity-50 flex flex-col items-center gap-2">
                                <Sun className="w-6 h-6 text-slate-400" />
                                <span className="text-sm font-medium">Clair</span>
                            </button>
                            <button className="p-4 rounded-xl bg-slate-800 border border-transparent opacity-50 flex flex-col items-center gap-2">
                                <Monitor className="w-6 h-6 text-slate-400" />
                                <span className="text-sm font-medium">Système</span>
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
