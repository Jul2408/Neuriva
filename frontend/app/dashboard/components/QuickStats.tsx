'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Flame, Target, TrendingUp, Award } from 'lucide-react';

interface QuickStatsProps {
    stats?: {
        streak: number;
        tasksCompleted: number;
        focusTime: number; // minutes
        weekProgress: number; // percentage
    };
}

export default function QuickStats({ stats }: QuickStatsProps) {
    // Mock data
    const defaultStats = {
        streak: 7,
        tasksCompleted: 12,
        focusTime: 145,
        weekProgress: 68
    };

    const currentStats = stats || defaultStats;

    const statCards = [
        {
            icon: Flame,
            label: 'Série',
            value: currentStats.streak,
            unit: 'jours',
            color: 'text-orange-400',
            bgColor: 'bg-orange-500/20'
        },
        {
            icon: Target,
            label: 'Complétées',
            value: currentStats.tasksCompleted,
            unit: 'tâches',
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/20'
        },
        {
            icon: TrendingUp,
            label: 'Focus',
            value: Math.floor(currentStats.focusTime / 60),
            unit: `h ${currentStats.focusTime % 60}min`,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/20'
        }
    ];

    return (
        <Card className="p-6">
            <h3 className="font-bold mb-6">Statistiques du jour</h3>

            <div className="space-y-4">
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-4"
                    >
                        <div className={`w-12 h-12 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</p>
                            <p className="text-xl font-display font-bold text-white">
                                {stat.value} <span className="text-sm font-sans font-normal text-slate-500">{stat.unit}</span>
                            </p>
                        </div>
                    </motion.div>
                ))}

                {/* Week Progress */}
                <div className="pt-4 border-t border-white/5">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Progression hebdo</span>
                        <span className="text-sm font-bold text-primary-400">{currentStats.weekProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-400"
                            initial={{ width: 0 }}
                            animate={{ width: `${currentStats.weekProgress}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                        />
                    </div>
                </div>

                {/* Achievement Badge (if applicable) */}
                {currentStats.streak >= 7 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-4 p-3 rounded-xl bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30"
                    >
                        <div className="flex items-center gap-3">
                            <Award className="w-5 h-5 text-yellow-400" />
                            <div>
                                <p className="text-xs font-bold text-yellow-400 uppercase">Nouveau Badge</p>
                                <p className="text-sm text-white">Série de 7 jours ! 🔥</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </Card>
    );
}
