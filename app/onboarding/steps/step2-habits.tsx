'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Zap, Activity } from 'lucide-react';

interface Step2Props {
    habits: {
        productiveHour: string;
        taskCount: number;
        stressLevel: number;
    };
    onChange: (key: string, value: any) => void;
}

export default function Step2Habits({ habits, onChange }: Step2Props) {
    const timeSlots = [
        { id: 'Matin', icon: <Sun className="w-6 h-6" />, label: 'Matin' },
        { id: 'Après-midi', icon: <Sunset className="w-6 h-6" />, label: 'Après-midi' },
        { id: 'Soir', icon: <Moon className="w-6 h-6" />, label: 'Soir' },
    ];

    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block"
                >
                    <Badge variant="info" className="px-4 py-1.5 text-sm uppercase tracking-wider">Analyse de Rythme</Badge>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                    Parlons de votre <span className="text-gradient-primary">rythme</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Ces informations permettent à NEURIVA de calibrer ses suggestions selon votre énergie.
                </p>
            </div>

            <div className="max-w-2xl mx-auto space-y-12">
                {/* Productive Hour */}
                <div className="space-y-6">
                    <label className="text-slate-300 font-semibold flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-400" />
                        À quelle heure êtes-vous le plus productif ?
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                        {timeSlots.map((slot) => (
                            <Card
                                key={slot.id}
                                className={`text-center py-6 cursor-pointer border-2 transition-all duration-300 ${habits.productiveHour === slot.id
                                    ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                                    }`}
                                onClick={() => onChange('productiveHour', slot.id)}
                            >
                                <div className="flex flex-col items-center gap-3">
                                    <div className={`p-3 rounded-xl ${habits.productiveHour === slot.id ? 'bg-primary-500 text-white' : 'bg-white/5 text-slate-500'}`}>
                                        {slot.icon}
                                    </div>
                                    <span className={`font-bold ${habits.productiveHour === slot.id ? 'text-white' : 'text-slate-400'}`}>
                                        {slot.label}
                                    </span>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>

                {/* Task Count Slider */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <label className="text-slate-300 font-semibold flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary-400" />
                            Volume de tâches quotidien
                        </label>
                        <span className="text-2xl font-bold text-primary-400">{habits.taskCount}</span>
                    </div>
                    <div className="relative h-12 flex items-center">
                        <input
                            type="range"
                            min="1"
                            max="20"
                            value={habits.taskCount}
                            onChange={(e) => onChange('taskCount', parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                        />
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-widest">
                        <span>Focus (1-5)</span>
                        <span>Intense (15+)</span>
                    </div>
                </div>

                {/* Stress Level */}
                <div className="space-y-6">
                    <label className="text-slate-300 font-semibold block">Niveau de stress actuel</label>
                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map((level) => (
                            <button
                                key={level}
                                onClick={() => onChange('stressLevel', level)}
                                className={`flex-1 py-6 rounded-[1.5rem] border-2 transition-all duration-300 text-2xl ${habits.stressLevel === level
                                    ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                                    }`}
                            >
                                {level === 1 ? '😌' : level === 2 ? '🙂' : level === 3 ? '😐' : level === 4 ? '😟' : '🤯'}
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-widest px-2">
                        <span>Serein</span>
                        <span>Surchargé</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
