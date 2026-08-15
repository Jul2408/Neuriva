'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, TrendingUp, Clock, CheckCircle2, AlertTriangle, Bell, Plus, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import MentalLoadGauge from './components/MentalLoadGauge';
import ActionCard from './components/ActionCard';
import NextActions from './components/NextActions';
import QuickStats from './components/QuickStats';
import ProTaskModal from './components/ProTaskModal';

import { useAuth } from '@/lib/context/AuthContext';
import { apiService } from '@/lib/api/apiService';

import NotificationBell from './components/NotificationBell';

export default function DashboardPage() {
    const { user } = useAuth();
    const [dashboardData, setDashboardData] = React.useState<any>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [error, setError] = React.useState<string | null>(null);

    const [showTaskModal, setShowTaskModal] = React.useState(false);
    const [quickTaskTitle, setQuickTaskTitle] = useState('');
    const [isSubmittingQuick, setIsSubmittingQuick] = useState(false);

    const fetchDashboardData = async () => {
        try {
            const data = await apiService.getDashboardData();
            setDashboardData(data);
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err);
            // If session expired, redirect to login
            if (err.message.includes('Session expired') || err.message.includes('login')) {
                window.location.href = '/auth/login';
                return;
            }
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    React.useEffect(() => {
        fetchDashboardData();
    }, []);

    const handleTaskCreated = () => {
        fetchDashboardData();
        // Optional: Add success toast here
    };

    const userName = user?.first_name || user?.username || "Aventurier";
    const currentTime = new Date().getHours();
    const greeting = currentTime < 12 ? "Bonjour" : currentTime < 18 ? "Bon après-midi" : "Bonsoir";

    // Format current date nicely
    const currentDateFormatted = new Intl.DateTimeFormat('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    }).format(new Date());

    const handleQuickTaskSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!quickTaskTitle.trim()) return;

        setIsSubmittingQuick(true);
        try {
            await apiService.createTask({
                title: quickTaskTitle,
                estimated_duration: 30, // default
                priority_label: 'medium', // default
                status: 'todo'
            });
            setQuickTaskTitle('');
            fetchDashboardData();
        } catch (err: any) {
            console.error('Erreur lors de la création rapide:', err);
            // Optionally could show a toast here
        } finally {
            setIsSubmittingQuick(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-6 md:p-8">
                {/* Header Skeleton */}
                <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div className="space-y-3 w-full max-w-md">
                        <div className="h-10 bg-white/5 rounded-xl w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-white/5 rounded-lg w-1/2 animate-pulse"></div>
                    </div>
                    <div className="flex gap-4">
                        <div className="h-10 w-10 bg-white/5 rounded-xl animate-pulse"></div>
                        <div className="h-10 w-32 bg-white/5 rounded-xl animate-pulse"></div>
                    </div>
                </div>

                {/* Main Grid Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Action Card Skeleton */}
                        <div className="h-64 bg-white/5 rounded-2xl animate-pulse border border-white/5"></div>
                        {/* Tasks List Skeleton */}
                        <div className="space-y-3">
                            <div className="h-6 bg-white/5 rounded w-1/4 animate-pulse mb-4"></div>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                        {/* Gauge Skeleton */}
                        <div className="h-48 bg-white/5 rounded-2xl animate-pulse border border-white/5"></div>
                        {/* Stats Skeleton */}
                        <div className="grid grid-cols-2 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background text-white p-6 md:p-8">
                <Card className="p-8 text-center border-red-500/20">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Erreur de chargement</h2>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <Button onClick={() => window.location.reload()}>Réessayer</Button>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <ProTaskModal
                isOpen={showTaskModal}
                onClose={() => setShowTaskModal(false)}
                onSuccess={handleTaskCreated}
            />

            {/* Dynamic Background Elements for premium feel */}
            <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px] pointer-events-none -z-10 animate-pulse-slow"></div>
            <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-secondary-600/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-primary-400 font-medium text-sm mb-2">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="capitalize">{currentDateFormatted}</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight">
                        {greeting}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">{userName}</span>
                    </h1>
                    <p className="text-slate-400 text-lg">Prêt à accomplir de grandes choses aujourd'hui ?</p>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <Button onClick={() => setShowTaskModal(true)} className="shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:shadow-[0_0_30px_rgba(139,92,246,0.5)] h-12 px-6 rounded-xl">
                        <Plus className="w-5 h-5 mr-2" />
                        Tâche Avancée
                    </Button>
                </div>
            </motion.div>

            {/* Quick Add Task Input */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="mb-10 relative group"
            >
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-secondary-500/20 to-primary-500/20 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                <form onSubmit={handleQuickTaskSubmit} className="relative flex items-center bg-background border border-white/10 rounded-2xl p-2 shadow-2xl">
                    <div className="pl-4 text-slate-400">
                        <Zap className="w-6 h-6 text-primary-400" />
                    </div>
                    <input 
                        type="text" 
                        value={quickTaskTitle}
                        onChange={(e) => setQuickTaskTitle(e.target.value)}
                        placeholder="Vider son sac : Que devez-vous faire ?"
                        className="flex-1 bg-transparent border-none text-white px-4 py-4 focus:outline-none focus:ring-0 text-lg placeholder:text-slate-500"
                        disabled={isSubmittingQuick}
                    />
                    <Button 
                        type="submit" 
                        size="icon"
                        disabled={!quickTaskTitle.trim() || isSubmittingQuick}
                        className={`mr-2 h-12 w-12 rounded-xl ${quickTaskTitle.trim() ? 'bg-primary-500 hover:bg-primary-600' : 'bg-white/5 text-slate-500'}`}
                    >
                        {isSubmittingQuick ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <ArrowRight className="w-5 h-5" />
                        )}
                    </Button>
                </form>
            </motion.div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Main Action */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Primary Action Card */}
                    <ActionCard task={dashboardData?.priority_task ? {
                        title: dashboardData.priority_task.title,
                        estimatedTime: dashboardData.priority_task.estimated_duration || 30,
                        priority: dashboardData.priority_task.priority_label || 'medium',
                        riskLevel: dashboardData.priority_task.risk_level === 'none' ? 'none' : dashboardData.priority_task.risk_level || 'none', // Backend maps none->none but just in case
                        reason: dashboardData.priority_task.reasoning || undefined // If backend provides reasoning
                    } : undefined} />

                    {/* Next Actions */}
                    <NextActions
                        tasks={dashboardData?.recent_tasks || []}
                        onAddTask={() => setShowTaskModal(true)}
                        onTaskUpdate={fetchDashboardData}
                    />
                </div>

                {/* Right Column - Stats & Insights */}
                <div className="space-y-6">
                    {/* Mental Load Gauge */}
                    <MentalLoadGauge loadScore={dashboardData?.mental_load?.load_score || 0} />

                    {/* Quick Stats */}
                    <QuickStats stats={dashboardData?.stats ? {
                        streak: dashboardData.stats.streak,
                        tasksCompleted: dashboardData.stats.completed_tasks,
                        focusTime: dashboardData.stats.focus_time || 0,
                        weekProgress: dashboardData.stats.week_progress || 0
                    } : undefined} />

                    {/* AI Insight Card */}
                    <Card className="p-6">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-secondary-500/20 flex items-center justify-center">
                                <Brain className="w-5 h-5 text-secondary-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-secondary-400 uppercase tracking-wider">Insight IA</h3>
                            </div>
                        </div>
                        <p className="text-slate-300 text-sm leading-relaxed">
                            {dashboardData?.ai_insight?.text || "Analyse en cours..."}
                        </p>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h3 className="font-bold mb-4">Actions rapides</h3>
                        <div className="space-y-3">
                            <Button variant="secondary" className="w-full justify-start" size="sm">
                                <Zap className="w-4 h-4 mr-2" />
                                Mode Focus
                            </Button>
                            <Button variant="secondary" className="w-full justify-start" size="sm">
                                <Clock className="w-4 h-4 mr-2" />
                                Voir le calendrier
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
