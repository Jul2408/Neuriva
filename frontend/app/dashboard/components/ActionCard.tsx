'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Clock, AlertTriangle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface ActionCardProps {
    task?: {
        title: string;
        estimatedTime: number; // minutes
        priority: 'low' | 'medium' | 'high' | 'urgent';
        riskLevel: 'none' | 'low' | 'medium' | 'high';
        reason: string;
    };
}

export default function ActionCard({ task }: ActionCardProps) {
    const router = useRouter();

    if (!task) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="p-8 relative overflow-hidden border-2 border-emerald-500/30 bg-gradient-to-br from-emerald-600/20 to-emerald-700/20">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center mb-4">
                            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Tout est sous contrôle</h2>
                        <p className="text-slate-300 mb-6">Aucune tâche urgente. Profitez-en pour avancer sur vos projets de fond ou prenez une pause bien méritée.</p>
                        <Button onClick={() => router.push('/tasks')} className="bg-emerald-500 hover:bg-emerald-600">
                            Voir toutes les tâches
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </Button>
                    </div>
                </Card>
            </motion.div>
        );
    }

    const priorityConfig = {
        low: { bg: 'from-slate-600/20 to-slate-700/20', border: 'border-slate-500/30', text: 'text-slate-400' },
        medium: { bg: 'from-blue-600/20 to-blue-700/20', border: 'border-blue-500/30', text: 'text-blue-400' },
        high: { bg: 'from-orange-600/20 to-orange-700/20', border: 'border-orange-500/30', text: 'text-orange-400' },
        urgent: { bg: 'from-red-600/20 to-red-700/20', border: 'border-red-500/30', text: 'text-red-400' }
    };

    const config = priorityConfig[task.priority] || priorityConfig.medium;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className={`p-8 relative overflow-hidden border-2 ${config.border} bg-gradient-to-br ${config.bg}`}>
                {/* Glow effect */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] -z-10"></div>

                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-primary-400 mb-2 block">
                            🎯 Action Prioritaire
                        </span>
                        <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight">
                            {task.title}
                        </h2>
                    </div>

                    {task.riskLevel !== 'none' && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/20 border border-red-500/30">
                            <AlertTriangle className="w-4 h-4 text-red-400" />
                            <span className="text-xs font-bold text-red-400 uppercase">Risque</span>
                        </div>
                    )}
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-6 mb-6 text-sm">
                    <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-300">
                            <strong className="text-white">{task.estimatedTime} min</strong> estimées
                        </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full bg-white/5 border border-white/10 ${config.text} font-bold text-xs uppercase`}>
                        {task.priority || 'Normal'}
                    </div>
                </div>

                {/* AI Reasoning */}
                <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-sm text-slate-400 mb-1">
                        <strong className="text-white">Pourquoi maintenant ?</strong>
                    </p>
                    <p className="text-sm text-slate-300">
                        {task.reason || "Cette tâche a été identifiée comme prioritaire pour atteindre vos objectifs."}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                        size="lg"
                        className="flex-1 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                        onClick={() => router.push('/focus')}
                    >
                        Commencer maintenant
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="lg"
                        onClick={() => router.push(`/tasks`)}
                    >
                        Reporter / Gérer
                    </Button>
                </div>
            </Card>
        </motion.div>
    );
}
