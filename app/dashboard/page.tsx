'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, TrendingUp, Clock, CheckCircle2, AlertTriangle, Bell } from 'lucide-react';
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-white p-6 md:p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
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

            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4"
            >
                <div>
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        {greeting}, <span className="text-gradient-primary">{userName}</span>
                    </h1>
                    <p className="text-slate-400">Voici ce qui mérite votre attention maintenant.</p>
                </div>
                <div className="flex items-center gap-4">
                    <NotificationBell />
                    <Button onClick={() => setShowTaskModal(true)} className="shadow-lg shadow-primary-500/20">
                        <Zap className="w-4 h-4 mr-2" />
                        Nouvelle Tâche
                    </Button>
                </div>
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
