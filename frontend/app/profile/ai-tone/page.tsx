'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Save, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiService, User } from '@/lib/api/apiService';
import Link from 'next/link';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

export default function AITonePage() {
    const [user, setUser] = useState<User | null>(null);
    const [aiTone, setAiTone] = useState<string>('coach');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await apiService.getCurrentUser();
                setUser(userData);
                setAiTone(userData.ai_tone || 'coach');
            } catch (error) {
                toast.error("Impossible de charger les préférences");
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, []);

    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            await apiService.updateUser({ ai_tone: aiTone });
            toast.success("Personnalité de l'IA mise à jour");
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    const tones = [
        { id: 'coach', label: 'Coach', icon: '🏆', desc: 'Motivant, proactif et direct. Idéal pour rester concentré sur vos objectifs et surmonter la procrastination.' },
        { id: 'zen', label: 'Zen', icon: '🌿', desc: 'Calme, bienveillant et apaisant. Parfait si vous êtes sensible à la charge mentale et au stress.' },
        { id: 'robot', label: 'Analytique', icon: '🤖', desc: 'Précis, factuel et structuré. Orienté vers les données sans fioritures émotionnelles.' }
    ] as const;

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-white p-6 md:p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Retour au profil
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                        <Sparkles className="w-8 h-8 text-primary-400" />
                        Ton de l'IA
                    </h1>
                    <p className="text-slate-400">Personnalisez le comportement de votre assistant NEURIVA</p>
                </div>

                <Card className="p-6">
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {tones.map((tone) => (
                                <motion.button
                                    key={tone.id}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setAiTone(tone.id)}
                                    className={`p-6 rounded-xl border-2 text-left flex flex-col gap-3 transition-all ${
                                        aiTone === tone.id
                                            ? 'bg-primary-500/10 border-primary-500 text-white'
                                            : 'bg-slate-900 border-white/5 text-slate-400 hover:border-white/20'
                                    }`}
                                >
                                    <div className="flex items-center justify-between w-full">
                                        <span className="text-3xl">{tone.icon}</span>
                                        {aiTone === tone.id && (
                                            <span className="text-xs font-bold text-primary-400 bg-primary-500/20 px-2 py-1 rounded-full">Actif</span>
                                        )}
                                    </div>
                                    <h3 className={`font-bold text-lg ${aiTone === tone.id ? 'text-white' : 'text-slate-300'}`}>
                                        {tone.label}
                                    </h3>
                                    <p className="text-xs leading-relaxed opacity-80">
                                        {tone.desc}
                                    </p>
                                </motion.button>
                            ))}
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-6 border-t border-white/10 mt-6">
                            <Button onClick={handleSubmit} variant="primary" disabled={isSaving || aiTone === user?.ai_tone} className="gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Enregistrer
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
