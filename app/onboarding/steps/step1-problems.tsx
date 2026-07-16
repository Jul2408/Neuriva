'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'framer-motion';

const problems = [
    { id: 'late', label: 'Je suis souvent en retard', icon: '⏰', color: 'text-amber-400' },
    { id: 'forget', label: "J'oublie des choses importantes", icon: '🧠', color: 'text-primary-400' },
    { id: 'overwhelmed', label: 'Je suis débordé', icon: '🌊', color: 'text-sky-400' },
    { id: 'procrastinate', label: 'Je procrastine', icon: '⏳', color: 'text-rose-400' },
    { id: 'start', label: 'Je ne sais pas par où commencer', icon: '🚦', color: 'text-emerald-400' },
    { id: 'stress', label: 'Je dors mal à cause du stress', icon: '🌙', color: 'text-indigo-400' },
    { id: 'distracted', label: 'Je suis facilement distrait', icon: '🦋', color: 'text-pink-400' },
    { id: 'motivation', label: 'Je manque de motivation', icon: '🔥', color: 'text-orange-400' },
];

interface Step1Props {
    selectedProblems: string[];
    onToggleProblem: (id: string) => void;
}

export default function Step1Problems({ selectedProblems, onToggleProblem }: Step1Props) {
    return (
        <div className="space-y-12">
            <div className="text-center space-y-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-block"
                >
                    <Badge variant="info" className="px-4 py-1.5 text-sm uppercase tracking-wider">Configuration Initiale</Badge>
                </motion.div>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight">
                    Quels sont vos <span className="text-gradient-primary">défis</span> quotidiens ?
                </h2>
                <p className="text-slate-400 text-lg max-w-xl mx-auto">
                    Sélectionnez les obstacles qui freinent votre productivité pour que NEURIVA puisse s'adapter.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
                {problems.map((problem, index) => {
                    const isSelected = selectedProblems.includes(problem.id);
                    return (
                        <motion.div
                            key={problem.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Card
                                className={`cursor-pointer transition-all duration-300 border-2 h-full flex items-center p-6 ${isSelected
                                    ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_20px_rgba(99,102,241,0.15)]'
                                    : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                                    }`}
                                onClick={() => onToggleProblem(problem.id)}
                            >
                                <div className="flex items-center gap-5 w-full">
                                    <div className={`w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl border border-white/5 ${isSelected ? 'border-primary-500/30' : ''}`}>
                                        {problem.icon}
                                    </div>
                                    <span className={`text-lg font-semibold transition-colors ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                                        {problem.label}
                                    </span>
                                    {isSelected && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="ml-auto w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </motion.div>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
