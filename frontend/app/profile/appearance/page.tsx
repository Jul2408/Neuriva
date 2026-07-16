'use client';

import { Card } from '@/components/ui/Card';
import { Monitor, Moon, Sun, ChevronLeft, Layout } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { apiService } from '@/lib/api/apiService';

export default function AppearancePage() {
    const [theme, setTheme] = useState('dark');
    const [density, setDensity] = useState('comfortable');

    useEffect(() => {
        const loadPreferences = async () => {
            const user = await apiService.getCurrentUser();
            if (user.preferences) {
                if (user.preferences.theme) setTheme(user.preferences.theme);
                if (user.preferences.density) setDensity(user.preferences.density);
            }
        };
        loadPreferences();
    }, []);

    const updateTheme = async (newTheme: string) => {
        setTheme(newTheme);
        await apiService.updateUser({ preferences: { ...JSON.parse(localStorage.getItem('user') || '{}').preferences, theme: newTheme } });
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
                        <Monitor className="w-8 h-8 text-primary-400" />
                        Apparence
                    </h1>
                    <p className="text-slate-400">Personnalisez l'interface de NEURIVA</p>
                </div>

                <div className="space-y-6">
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4">Thème</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <button onClick={() => updateTheme('dark')} className="relative group">
                                {theme === 'dark' && <div className="absolute inset-0 bg-primary-500/20 blur-xl transition-opacity" />}
                                <div className={`relative p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${theme === 'dark' ? 'bg-slate-900 border-primary-500' : 'bg-slate-900 border-transparent hover:border-slate-700'}`}>
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center">
                                        <Moon className={`w-6 h-6 ${theme === 'dark' ? 'text-primary-400' : 'text-slate-400'}`} />
                                    </div>
                                    <span className="font-medium text-white">Sombre</span>
                                    {theme === 'dark' && <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">Actif</span>}
                                </div>
                            </button>

                            <button onClick={() => updateTheme('light')} className="relative group opacity-75 hover:opacity-100 transition-opacity">
                                <div className={`relative p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${theme === 'light' ? 'bg-slate-100 border-primary-500' : 'bg-slate-100 border-transparent hover:border-slate-300'}`}>
                                    <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center">
                                        <Sun className="w-6 h-6 text-slate-500" />
                                    </div>
                                    <span className="font-medium text-slate-900">Clair</span>
                                    {theme === 'light' && <span className="text-xs text-primary-600 bg-primary-500/10 px-2 py-0.5 rounded-full">Actif</span>}
                                </div>
                            </button>

                            <button onClick={() => updateTheme('system')} className="relative group opacity-75 hover:opacity-100 transition-opacity">
                                <div className={`relative p-6 rounded-xl border-2 flex flex-col items-center gap-3 transition-colors ${theme === 'system' ? 'bg-slate-800 border-primary-500' : 'bg-slate-800 border-transparent hover:border-slate-600'}`}>
                                    <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center">
                                        <Monitor className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <span className="font-medium text-slate-300">Système</span>
                                    {theme === 'system' && <span className="text-xs text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">Actif</span>}
                                </div>
                            </button>
                        </div>
                    </Card>
                    {/* Rest of the component... */}
                    <Card className="p-6">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                            <Layout className="w-5 h-5 text-purple-400" /> Densité
                        </h3>
                        <div className="flex flex-col gap-2">
                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer">
                                <div className="w-4 h-4 rounded-full border border-primary-500 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-primary-500" />
                                </div>
                                <div>
                                    <p className="font-medium">Confortable</p>
                                    <p className="text-sm text-slate-400">Espacement standard, idéal pour la concentration</p>
                                </div>
                            </label>
                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/5 cursor-pointer opacity-50">
                                <div className="w-4 h-4 rounded-full border border-slate-600" />
                                <div>
                                    <p className="font-medium">Compact</p>
                                    <p className="text-sm text-slate-400">Plus d'informations sur un seul écran</p>
                                </div>
                            </label>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}

