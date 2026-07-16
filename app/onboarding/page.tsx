'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Logo } from '@/components/ui/Logo';
import Step1Problems from './steps/step1-problems';
import Step2Habits from './steps/step2-habits';
import Step3Preferences from './steps/step3-preferences';

export default function OnboardingPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [data, setData] = useState({
        problems: [] as string[],
        habits: {
            productiveHour: 'Matin',
            taskCount: 5,
            stressLevel: 3,
        },
        preferences: {
            aiTone: 'coach',
            notificationLevel: 'normal',
        },
    });

    const nextStep = () => {
        if (step < 3) setStep(step + 1);
        else handleFinish();
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleFinish = async () => {
        try {
            // Sauvegarder les données d'onboarding dans le profil utilisateur
            const { apiService } = await import('@/lib/api/apiService');
            await apiService.updateUser({
                ai_tone: data.preferences.aiTone,
                notification_level: data.preferences.notificationLevel,
                preferences: {
                    onboarding_completed: true,
                    problems: data.problems,          // ["late", "forget", "overwhelmed", ...]
                    productive_hour: data.habits.productiveHour,
                    daily_task_count: data.habits.taskCount,
                    stress_level: data.habits.stressLevel,
                },
            });
        } catch (error) {
            console.error('Erreur sauvegarde onboarding:', error);
        }
        router.push('/dashboard');
    };

    const updateHabits = (key: string, value: any) => {
        setData((prev) => ({
            ...prev,
            habits: { ...prev.habits, [key]: value },
        }));
    };

    const updatePreferences = (key: string, value: any) => {
        setData((prev) => ({
            ...prev,
            preferences: { ...prev.preferences, [key]: value },
        }));
    };

    const toggleProblem = (id: string) => {
        setData((prev) => ({
            ...prev,
            problems: prev.problems.includes(id)
                ? prev.problems.filter((p) => p !== id)
                : [...prev.problems, id],
        }));
    };

    return (
        <main className="min-h-screen bg-background text-white flex flex-col relative overflow-hidden font-sans">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary-600/10 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-secondary-600/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-grid opacity-10"></div>
            </div>

            {/* Header */}
            <header className="relative z-10 p-8 flex justify-between items-center max-w-7xl mx-auto w-full">
                <div className="flex items-center gap-3">
                    <Logo />
                    <span className="text-xl font-bold font-display tracking-tight hover:text-primary-400 transition-colors">NEURIVA</span>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-400 font-medium">
                        Étape <span className="text-white">{step}</span> sur 3
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-1 rounded-full transition-all duration-500 ${s <= step ? 'w-8 bg-gradient-to-r from-primary-500 to-secondary-500' : 'w-2 bg-white/10'
                                    }`}
                            ></div>
                        ))}
                    </div>
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 relative z-10 flex flex-col items-center justify-center p-6 max-w-5xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 50, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: -50, filter: 'blur(10px)' }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                        className="w-full"
                    >
                        {step === 1 && (
                            <Step1Problems
                                selectedProblems={data.problems}
                                onToggleProblem={toggleProblem}
                            />
                        )}
                        {step === 2 && (
                            <Step2Habits
                                habits={data.habits}
                                onChange={updateHabits}
                            />
                        )}
                        {step === 3 && (
                            <Step3Preferences
                                preferences={data.preferences}
                                onChange={updatePreferences}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Footer */}
            <footer className="relative z-20 p-8 border-t border-white/5 bg-background/50 backdrop-blur-xl">
                <div className="max-w-4xl mx-auto flex justify-between items-center">
                    <Button
                        variant="ghost"
                        onClick={prevStep}
                        className={step === 1 ? 'invisible' : 'flex items-center gap-2'}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Retour
                    </Button>

                    <Button
                        onClick={nextStep}
                        className="min-w-[180px] h-14 text-lg group rounded-full shadow-[0_0_20px_rgba(139,92,246,0.2)]"
                    >
                        {step === 3 ? (
                            <span className="flex items-center gap-2">
                                Terminer <Sparkles className="w-5 h-5" />
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                Suivant <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>
                </div>
            </footer>
        </main>
    );
}
