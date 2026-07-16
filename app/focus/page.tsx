'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw, X, Zap, Wind } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

type FocusState = 'idle' | 'running' | 'paused' | 'completed';

export default function FocusPage() {
    const [state, setState] = useState<FocusState>('idle');
    const [duration, setDuration] = useState(25); // minutes
    const [timeLeft, setTimeLeft] = useState(duration * 60); // seconds
    const [showBreathing, setShowBreathing] = useState(false);

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (state === 'running' && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setState('completed');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [state, timeLeft]);

    const handleStart = () => {
        if (state === 'idle') {
            setTimeLeft(duration * 60);
        }
        setState('running');
    };

    const handlePause = () => {
        setState('paused');
    };

    const handleReset = () => {
        setState('idle');
        setTimeLeft(duration * 60);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((duration * 60 - timeLeft) / (duration * 60)) * 100;

    if (state === 'running' || state === 'paused') {
        return (
            <div className="min-h-screen bg-background text-white flex items-center justify-center p-6 relative overflow-hidden">
                {/* Animated background */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/20 rounded-full blur-[150px] animate-pulse-slow"></div>
                </div>

                <div className="relative z-10 max-w-2xl w-full">
                    {/* Close button */}
                    <button
                        onClick={handleReset}
                        className="absolute top-0 right-0 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    {/* Timer */}
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-9xl md:text-[12rem] font-display font-bold mb-6 leading-none"
                        >
                            {formatTime(timeLeft)}
                        </motion.div>

                        {/* Progress bar */}
                        <div className="w-full max-w-md mx-auto h-2 bg-white/5 rounded-full overflow-hidden mb-8">
                            <motion.div
                                className="h-full bg-gradient-to-r from-primary-500 to-secondary-400"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>

                        <p className="text-xl text-slate-400">
                            {state === 'paused' ? 'En pause' : 'Restez concentré...'}
                        </p>
                    </div>

                    {/* Controls */}
                    <div className="flex justify-center gap-4">
                        {state === 'running' ? (
                            <Button size="lg" onClick={handlePause} className="w-32">
                                <Pause className="w-5 h-5 mr-2" />
                                Pause
                            </Button>
                        ) : (
                            <Button size="lg" onClick={handleStart} className="w-32">
                                <Play className="w-5 h-5 mr-2" />
                                Reprendre
                            </Button>
                        )}
                        <Button size="lg" variant="secondary" onClick={handleReset} className="w-32">
                            <RotateCcw className="w-5 h-5 mr-2" />
                            Reset
                        </Button>
                    </div>

                    {/* Breathing exercise */}
                    {state === 'paused' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-12 text-center"
                        >
                            <Button
                                variant="secondary"
                                onClick={() => setShowBreathing(true)}
                                className="gap-2"
                            >
                                <Wind className="w-4 h-4" />
                                Exercice de respiration
                            </Button>
                        </motion.div>
                    )}
                </div>
            </div>
        );
    }

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
                    <p className="text-slate-400 mb-8">
                        Excellent travail ! Vous avez complété {duration} minutes de focus intense.
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

    // Idle state - Setup
    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                    Mode <span className="text-gradient-primary">Focus</span>
                </h1>
                <p className="text-slate-400 mb-12">Concentration profonde sans distractions</p>

                {/* Duration selection */}
                <Card className="p-8 mb-8">
                    <h3 className="text-xl font-bold mb-6">Choisissez la durée</h3>
                    <div className="grid grid-cols-3 gap-4">
                        {[25, 45, 60].map(mins => (
                            <button
                                key={mins}
                                onClick={() => setDuration(mins)}
                                className={`p-6 rounded-xl border-2 transition-all ${duration === mins
                                        ? 'border-primary-500 bg-primary-500/20'
                                        : 'border-white/10 bg-white/5 hover:border-white/20'
                                    }`}
                            >
                                <div className="text-4xl font-display font-bold mb-2">{mins}</div>
                                <div className="text-sm text-slate-400">minutes</div>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Tips */}
                <Card className="p-8 mb-8">
                    <h3 className="text-xl font-bold mb-4">Conseils pour une session réussie</h3>
                    <ul className="space-y-3 text-slate-300">
                        <li className="flex items-start gap-3">
                            <span className="text-primary-400">✓</span>
                            <span>Mettez votre téléphone en mode avion</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary-400">✓</span>
                            <span>Fermez tous les onglets inutiles</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary-400">✓</span>
                            <span>Préparez de l'eau à portée de main</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-primary-400">✓</span>
                            <span>Choisissez UNE tâche à accomplir</span>
                        </li>
                    </ul>
                </Card>

                {/* Start button */}
                <Button
                    size="lg"
                    className="w-full h-16 text-xl shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                    onClick={handleStart}
                >
                    <Play className="w-6 h-6 mr-3" />
                    Commencer la session ({duration} min)
                </Button>
            </div>
        </div>
    );
}
