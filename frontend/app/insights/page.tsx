'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Zap, Target, Award, Calendar } from 'lucide-react';
import { Card } from '@/components/ui/Card';

export default function InsightsPage() {
    // Mock data
    const weeklyStats = {
        tasksCompleted: 42,
        focusTime: 18.5, // hours
        streak: 12,
        productivity: 87, // percentage
        improvement: 15 // percentage vs last week
    };

    const dailyData = [
        { day: 'Lun', tasks: 8, focus: 3.5 },
        { day: 'Mar', tasks: 6, focus: 2.8 },
        { day: 'Mer', tasks: 7, focus: 4.2 },
        { day: 'Jeu', tasks: 9, focus: 3.9 },
        { day: 'Ven', tasks: 7, focus: 2.6 },
        { day: 'Sam', tasks: 3, focus: 1.2 },
        { day: 'Dim', tasks: 2, focus: 0.3 }
    ];

    const productiveHours = [
        { hour: '8h-10h', score: 45 },
        { hour: '10h-12h', score: 92 },
        { hour: '14h-16h', score: 78 },
        { hour: '16h-18h', score: 65 },
        { hour: '20h-22h', score: 38 }
    ];

    const achievements = [
        { id: 1, title: 'Série de 7 jours', icon: '🔥', unlocked: true },
        { id: 2, title: '50 tâches complétées', icon: '🎯', unlocked: true },
        { id: 3, title: '10h de focus', icon: '⚡', unlocked: true },
        { id: 4, title: 'Semaine parfaite', icon: '💎', unlocked: false }
    ];

    const maxTasks = Math.max(...dailyData.map(d => d.tasks));
    const maxFocus = Math.max(...dailyData.map(d => d.focus));

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        Insights & <span className="text-gradient-primary">Statistiques</span>
                    </h1>
                    <p className="text-slate-400">Analysez votre productivité et progressez</p>
                </div>

                {/* Weekly Summary */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <Target className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-bold mb-1">{weeklyStats.tasksCompleted}</p>
                        <p className="text-xs text-slate-400">Tâches cette semaine</p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                <Zap className="w-5 h-5 text-blue-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-bold mb-1">{weeklyStats.focusTime}h</p>
                        <p className="text-xs text-slate-400">Temps de focus</p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                                <Award className="w-5 h-5 text-orange-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-bold mb-1">{weeklyStats.streak}</p>
                        <p className="text-xs text-slate-400">Jours de série</p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-primary-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-bold mb-1">{weeklyStats.productivity}%</p>
                        <p className="text-xs text-slate-400">Productivité</p>
                    </Card>

                    <Card className="p-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-bold mb-1 text-emerald-400">+{weeklyStats.improvement}%</p>
                        <p className="text-xs text-slate-400">vs semaine dernière</p>
                    </Card>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Daily Activity Chart */}
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-6">Activité de la semaine</h3>
                        <div className="space-y-4">
                            {dailyData.map((day, index) => (
                                <motion.div
                                    key={day.day}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-sm text-slate-400 w-12">{day.day}</span>
                                        <div className="flex-1 flex gap-2">
                                            {/* Tasks bar */}
                                            <div className="flex-1">
                                                <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-primary-500 to-secondary-400 flex items-center justify-end pr-2"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(day.tasks / maxTasks) * 100}%` }}
                                                        transition={{ duration: 0.8, delay: index * 0.1 }}
                                                    >
                                                        <span className="text-xs font-bold">{day.tasks}</span>
                                                    </motion.div>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">tâches</p>
                                            </div>
                                            {/* Focus bar */}
                                            <div className="flex-1">
                                                <div className="h-8 bg-white/5 rounded-lg overflow-hidden">
                                                    <motion.div
                                                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 flex items-center justify-end pr-2"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(day.focus / maxFocus) * 100}%` }}
                                                        transition={{ duration: 0.8, delay: index * 0.1 + 0.2 }}
                                                    >
                                                        <span className="text-xs font-bold">{day.focus}h</span>
                                                    </motion.div>
                                                </div>
                                                <p className="text-xs text-slate-500 mt-1">focus</p>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </Card>

                    {/* Productive Hours Heatmap */}
                    <Card className="p-6">
                        <h3 className="text-xl font-bold mb-6">Heures productives</h3>
                        <div className="space-y-4">
                            {productiveHours.map((slot, index) => (
                                <motion.div
                                    key={slot.hour}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-center gap-4"
                                >
                                    <span className="text-sm text-slate-400 w-20">{slot.hour}</span>
                                    <div className="flex-1 h-12 bg-white/5 rounded-lg overflow-hidden relative">
                                        <motion.div
                                            className={`h-full ${slot.score > 80 ? 'bg-emerald-500/30' :
                                                    slot.score > 60 ? 'bg-blue-500/30' :
                                                        slot.score > 40 ? 'bg-yellow-500/30' :
                                                            'bg-slate-500/30'
                                                }`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${slot.score}%` }}
                                            transition={{ duration: 1, delay: index * 0.1 }}
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-bold">
                                            {slot.score}%
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        <div className="mt-6 p-4 rounded-xl bg-primary-500/10 border border-primary-500/20">
                            <p className="text-sm text-primary-300">
                                💡 <strong>Insight:</strong> Vous êtes 92% plus productif entre 10h et 12h. Planifiez vos tâches complexes dans ce créneau.
                            </p>
                        </div>
                    </Card>
                </div>

                {/* Achievements */}
                <Card className="p-6">
                    <h3 className="text-xl font-bold mb-6">Succès débloqués</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {achievements.map((achievement, index) => (
                            <motion.div
                                key={achievement.id}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={`p-6 rounded-xl border-2 text-center ${achievement.unlocked
                                        ? 'border-yellow-500/30 bg-yellow-500/10'
                                        : 'border-white/10 bg-white/5 opacity-50'
                                    }`}
                            >
                                <div className="text-4xl mb-3">{achievement.icon}</div>
                                <p className="text-sm font-bold">{achievement.title}</p>
                                {achievement.unlocked && (
                                    <p className="text-xs text-yellow-400 mt-2">✓ Débloqué</p>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}
