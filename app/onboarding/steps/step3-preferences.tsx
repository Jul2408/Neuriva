'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Bot, Zap, Wind, Bell, BellOff, BellRing } from 'lucide-react';

interface Step3Props {
    preferences: {
        aiTone: string;
        notificationLevel: string;
    };
    onChange: (key: string, value: any) => void;
}

export default function Step3Preferences({ preferences, onChange }: Step3Props) {
    const tones = [
        { id: 'robot', label: 'Robot', desc: 'Factuel & Précis', icon: <Bot className="w-8 h-8" />, color: 'text-slate-400' },
        { id: 'coach', label: 'Coach', desc: 'Motivant & Proactif', icon: <Zap className="w-8 h-8" />, color: 'text-yellow-400' },
        { id: 'zen', label: 'Zen', desc: 'Apaisant & Calme', icon: <Wind className="w-8 h-8" />, color: 'text-sky-400' },
    ];

    const notifLevels = [
        { id: 'minimal', label: 'Minimal', icon: <BellOff className="w-5 h-5" />, desc: "Urgences critiques" },
        { id: 'normal', label: 'Normal', icon: <Bell className="w-5 h-5" />, desc: "Rappels intelligents" },
        { id: 'maximum', label: 'Maximum', icon: <BellRing className="w-5 h-5" />, desc: "Accompagnement total" },
    ];

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block"
                >
                    <Badge variant="info" className="px-4 py-1.5 text-sm uppercase tracking-wider">Personnalisation</Badge>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                    Configurez votre <span className="text-gradient-primary">assistant</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Choisissez comment NEURIVA doit interagir avec vous au quotidien.
                </p>
            </div>

            <div className="max-w-3xl mx-auto space-y-12">
                {/* AI Tone */}
                <div className="space-y-6">
                    <label className="text-slate-300 font-semibold block">Ton de l'IA</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tones.map((tone) => (
                            <Card
                                key={tone.id}
                                className={`cursor-pointer border-2 transition-all duration-300 p-8 ${preferences.aiTone === tone.id
                                    ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                                    }`}
                                onClick={() => onChange('aiTone', tone.id)}
                            >
                                <div className="flex flex-col items-center text-center gap-4">
                                    <div className={`p-4 rounded-2xl bg-white/5 border border-white/5 ${preferences.aiTone === tone.id ? 'text-primary-400 border-primary-500/30' : 'text-slate-500'}`}>
                                        {tone.icon}
                                    </div>
                                    <div>
                                        <span className={`text-xl font-bold block ${preferences.aiTone === tone.id ? 'text-white' : 'text-slate-400'}`}>
                                            {tone.label}
                                        </span>
                                        <span className="text-sm text-slate-500 mt-1 block">{tone.desc}</span>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Notification Level */}
                <div className="space-y-6">
                    <label className="text-slate-300 font-semibold block">Niveau d'intervention</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {notifLevels.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => onChange('notificationLevel', level.id)}
                                className={`flex flex-col items-start p-6 rounded-[1.5rem] border-2 transition-all duration-300 text-left ${preferences.notificationLevel === level.id
                                    ? 'border-primary-500 bg-primary-500/10'
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                                    }`}
                            >
                                <div className={`p-2 rounded-lg mb-4 ${preferences.notificationLevel === level.id ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                                    {level.icon}
                                </div>
                                <span className={`font-bold block ${preferences.notificationLevel === level.id ? 'text-white' : 'text-slate-400'}`}>
                                    {level.label}
                                </span>
                                <span className="text-xs text-slate-500 mt-1">{level.desc}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
