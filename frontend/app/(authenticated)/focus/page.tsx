'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Zap, Wind, ChevronRight, Clock, AlertTriangle, Minus, Plus } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { playNotificationSound } from '@/lib/audio';
import { apiService } from '@/lib/api/apiService';

type FocusState = 'idle' | 'running' | 'paused' | 'completed';

interface TaskSuggestion {
    id: string;
    title: string;
    priority: string;
    estimatedTime: number | null;
    dueDate: Date | null;
    riskLevel?: string;
}

function getPriorityColor(priority: string) {
    switch (priority) {
        case 'urgent': return 'text-red-400 bg-red-500/10 border-red-500/20';
        case 'high': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
        case 'medium': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
        default: return 'text-slate-400 bg-white/5 border-white/10';
    }
}

function getPriorityLabel(priority: string) {
    switch (priority) {
        case 'urgent': return 'Urgente';
        case 'high': return 'Haute';
        case 'medium': return 'Moyenne';
        default: return 'Basse';
    }
}

function isToday(date: Date | null): boolean {
    if (!date) return false;
    const today = new Date();
    return date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear();
}

export default function FocusPage() {
    const [state, setState] = useState<FocusState>('idle');
    const [duration, setDuration] = useState(25);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [tasks, setTasks] = useState<TaskSuggestion[]>([]);
    const [selectedTask, setSelectedTask] = useState<TaskSuggestion | null>(null);
    const [isLoadingTasks, setIsLoadingTasks] = useState(true);
    const [customDuration, setCustomDuration] = useState('25');

    // Charger les tâches non terminées
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const response = await apiService.getTasks();
                const data = response.results || response;
                if (!Array.isArray(data)) return;

                const pending = data
                    .filter((t: any) => t.status !== 'done')
                    .map((t: any) => ({
                        id: t.id,
                        title: t.title,
                        priority: t.priority_label || 'low',
                        estimatedTime: t.estimated_duration || null,
                        dueDate: t.due_date ? new Date(t.due_date) : null,
                        riskLevel: t.risk_level,
                    }))
                    // Trier : urgent > high > today > medium > low
                    .sort((a: TaskSuggestion, b: TaskSuggestion) => {
                        const order: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
                        const aScore = (order[a.priority] ?? 3) + (isToday(a.dueDate) ? -0.5 : 0);
                        const bScore = (order[b.priority] ?? 3) + (isToday(b.dueDate) ? -0.5 : 0);
                        return aScore - bScore;
                    });

                setTasks(pending);

                // Pré-sélectionner la première tâche urgente ou d'aujourd'hui
                const suggested = pending.find((t: TaskSuggestion) =>
                    t.priority === 'urgent' || t.priority === 'high' || isToday(t.dueDate)
                ) || pending[0] || null;

                if (suggested) {
                    setSelectedTask(suggested);
                    const mins = suggested.estimatedTime ?? 25;
                    setDuration(mins);
                    setCustomDuration(String(mins));
                    setTimeLeft(mins * 60);
                }
            } catch (e) {
                console.error('Focus: erreur chargement tâches', e);
            } finally {
                setIsLoadingTasks(false);
            }
        };
        fetchTasks();
    }, []);

    const sessionStartedAt = useRef<Date | null>(null);

    // Timer
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (state === 'running' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setState('completed');
                        playNotificationSound('focus-end');
                        
                        // Save session
                        if (sessionStartedAt.current) {
                            apiService.createFocusSession({
                                task: selectedTask?.id,
                                planned_duration: duration,
                                actual_duration: duration,
                                started_at: sessionStartedAt.current.toISOString(),
                                completed: true
                            }).catch(e => console.error("Erreur de sauvegarde session focus:", e));
                            sessionStartedAt.current = null;
                        }
                        
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [state, timeLeft, duration, selectedTask]);

    const handleSelectTask = (task: TaskSuggestion) => {
        setSelectedTask(task);
        const mins = task.estimatedTime ?? 25;
        setDuration(mins);
        setCustomDuration(String(mins));
        setTimeLeft(mins * 60);
    };

    const handleDurationChange = (mins: number) => {
        const clamped = Math.max(5, Math.min(180, mins));
        setDuration(clamped);
        setCustomDuration(String(clamped));
        setTimeLeft(clamped * 60);
    };

    const handleStart = () => {
        if (state === 'idle') {
            setTimeLeft(duration * 60);
            sessionStartedAt.current = new Date();
        }
        setState('running');
        playNotificationSound('focus-start');
    };

    const handlePause = () => setState('paused');
    const handleReset = () => {
        setState('idle');
        setTimeLeft(duration * 60);
        sessionStartedAt.current = null;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

    // ── État RUNNING / PAUSED ─────────────────────────────────────────────────
    if (state === 'running' || state === 'paused') {
        return (
            <div className="min-h-screen bg-background text-white flex items-center justify-center p-6 relative overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[150px] animate-pulse-slow" />
                </div>

                <div className="relative z-10 w-full max-w-lg mx-auto">
                    <button
                        onClick={handleReset}
                        className="absolute top-0 right-0 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {selectedTask && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8 text-center"
                        >
                            <p className="text-slate-500 text-sm mb-1">Session en cours pour</p>
                            <p className="text-white font-bold text-lg">{selectedTask.title}</p>
                        </motion.div>
                    )}

                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-9xl md:text-[12rem] font-display font-bold mb-6 leading-none"
                        >
                            {formatTime(timeLeft)}
                        </motion.div>

                        <div className="w-full max-w-md mx-auto h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-400"
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        <p className="text-xl text-slate-400">
                            {state === 'paused' ? 'En pause' : 'Restez concentré...'}
                        </p>
                    </div>

                    <div className="flex justify-center gap-4">
                        {state === 'running' ? (
                            <Button size="lg" onClick={handlePause} className="w-32">
                                <Pause className="w-5 h-5 mr-2" /> Pause
                            </Button>
                        ) : (
                            <Button size="lg" onClick={handleStart} className="w-32">
                                <Play className="w-5 h-5 mr-2" /> Reprendre
                            </Button>
                        )}
                        <Button size="lg" variant="secondary" onClick={handleReset} className="w-32">
                            <RotateCcw className="w-5 h-5 mr-2" /> Reset
                        </Button>
                    </div>

                    {state === 'paused' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 text-center"
                        >
                            <Button variant="secondary" className="gap-2">
                                <Wind className="w-4 h-4" /> Exercice de respiration
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

    // ── État COMPLETED ────────────────────────────────────────────────────────
    if (state === 'completed') {
        return (
            <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
                <Card className="max-w-md w-full p-12 text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', duration: 0.6 }}
                        className="w-24 h-24 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                    >
                        <Zap className="w-12 h-12 text-emerald-400" />
                    </motion.div>
                    <h2 className="text-3xl font-display font-bold mb-4">Session terminée !</h2>
                    {selectedTask && (
                        <p className="text-primary-300 mb-2 font-medium">{selectedTask.title}</p>
                    )}
                    <p className="text-slate-400 mb-8">
                        Excellent travail ! {duration} minutes de focus intense.
                    </p>
                    <div className="space-y-3">
                        <Button size="lg" className="w-full" onClick={handleReset}>
                            Nouvelle session
                        </Button>
                        <Button size="lg" variant="secondary" className="w-full" onClick={() => window.history.back()}>
                            Retour au dashboard
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    // ── État IDLE — Setup ─────────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="w-full max-w-2xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                    Mode <span className="text-gradient-primary">Focus</span>
                </h1>
                <p className="text-slate-400 mb-10">Concentre-toi sur une seule tâche à la fois.</p>

                {/* Sélection de tâche */}
                <Card className="p-6 mb-6">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-primary-400" />
                        Quelle tâche attaquer ?
                    </h3>

                    {isLoadingTasks ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-14 bg-white/5 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : tasks.length === 0 ? (
                        <p className="text-slate-500 text-sm py-4 text-center">
                            Aucune tâche en attente. Crée-en une d'abord !
                        </p>
                    ) : (
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1 custom-scrollbar">
                            {tasks.map(task => (
                                <button
                                    key={task.id}
                                    onClick={() => handleSelectTask(task)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                                        selectedTask?.id === task.id
                                            ? 'border-primary-500 bg-primary-500/10'
                                            : 'border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/5'
                                    }`}
                                >
                                    <div className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold border ${getPriorityColor(task.priority)}`}>
                                        {getPriorityLabel(task.priority)}
                                    </div>
                                    <span className="flex-1 text-sm font-medium truncate">{task.title}</span>
                                    <div className="flex items-center gap-3 shrink-0">
                                        {isToday(task.dueDate) && (
                                            <span className="text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                                                Aujourd'hui
                                            </span>
                                        )}
                                        {task.estimatedTime && (
                                            <span className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {task.estimatedTime}min
                                            </span>
                                        )}
                                        {selectedTask?.id === task.id && (
                                            <ChevronRight className="w-4 h-4 text-primary-400" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </Card>

                {/* Réglage de la durée */}
                <Card className="p-6 mb-8">
                    <h3 className="text-lg font-bold mb-5 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-secondary-400" />
                        Durée de la session
                    </h3>

                    {/* Raccourcis rapides */}
                    <div className="grid grid-cols-4 gap-2 mb-5">
                        {[15, 25, 45, 60].map(mins => (
                            <button
                                key={mins}
                                onClick={() => handleDurationChange(mins)}
                                className={`py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                                    duration === mins
                                        ? 'border-primary-500 bg-primary-500/20 text-white'
                                        : 'border-white/10 bg-white/5 text-slate-400 hover:border-white/20 hover:text-white'
                                }`}
                            >
                                {mins}<span className="text-xs font-normal ml-0.5">min</span>
                            </button>
                        ))}
                    </div>

                    {/* Réglage précis */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => handleDurationChange(duration - 5)}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <Minus className="w-4 h-4" />
                        </button>

                        <div className="flex-1">
                            <input
                                type="range"
                                min={5}
                                max={120}
                                step={5}
                                value={duration}
                                onChange={e => handleDurationChange(Number(e.target.value))}
                                className="w-full accent-primary-500"
                            />
                            <div className="flex justify-between text-xs text-slate-600 mt-1">
                                <span>5 min</span>
                                <span>2h</span>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDurationChange(duration + 5)}
                            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                        </button>

                        {/* Input numérique direct */}
                        <div className="flex items-center gap-1">
                            <input
                                type="number"
                                min={5}
                                max={180}
                                value={customDuration}
                                onChange={e => setCustomDuration(e.target.value)}
                                onBlur={() => handleDurationChange(Number(customDuration))}
                                onKeyDown={e => e.key === 'Enter' && handleDurationChange(Number(customDuration))}
                                className="w-16 bg-white/5 border border-white/10 rounded-lg px-2 py-2 text-center text-white text-sm focus:outline-none focus:border-primary-500"
                            />
                            <span className="text-slate-500 text-xs">min</span>
                        </div>
                    </div>
                </Card>

                {/* Résumé + bouton démarrer */}
                <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-6">
                    <div className="flex-1">
                        <p className="text-sm text-slate-500 mb-0.5">Prêt à démarrer</p>
                        <p className="font-bold text-white truncate">
                            {selectedTask ? selectedTask.title : 'Session libre'}
                        </p>
                    </div>
                    <div className="text-2xl font-display font-bold text-primary-400">
                        {duration}min
                    </div>
                </div>

                <Button
                    size="lg"
                    className="w-full h-16 text-xl shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                    onClick={handleStart}
                >
                    <Play className="w-6 h-6 mr-3" />
                    Commencer la session
                </Button>
            </div>
        </div>
    );
}
