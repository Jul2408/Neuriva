'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, Bell, Shield, Database, LogOut, Crown, ChevronRight, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { apiService, User as UserType } from '@/lib/api/apiService';
import { useRouter } from 'next/navigation';
import EditProfileModal from './components/EditProfileModal';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<UserType | null>(null);
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        focusHours: 0,
        currentStreak: 0
    });
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfileData = async () => {
        try {
            setIsLoading(true);
            const userData = await apiService.getCurrentUser();
            setUser(userData);

            // Fetch real stats from dashboard endpoint
            const dashboardData = await apiService.getDashboardData();

            // Fix stats mapping to match backend keys (stats.total_tasks, etc)
            const backendStats = dashboardData.stats || {};
            setStats({
                totalTasks: backendStats.total_tasks || 0,
                completedTasks: backendStats.completed_tasks || 0,
                focusHours: Math.round((backendStats.focus_time || 0) / 60 * 10) / 10,
                currentStreak: userData.current_streak || backendStats.streak || 0
            });
        } catch (error: any) {
            console.error('Failed to fetch profile data:', error);
            if (error.message?.includes('401') || error.message?.includes('fetch user')) {
                router.push('/auth/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, []);

    const handleLogout = () => {
        apiService.logout();
        router.push('/auth/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white gap-4">
                <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 animate-pulse">Chargement de votre profil...</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-white p-6 text-center">
                <h2 className="text-2xl font-bold mb-4">Oups ! Session expirée</h2>
                <p className="text-slate-400 mb-8">Nous n'avons pas pu récupérer vos informations. Veuillez vous reconnecter.</p>
                <Button onClick={() => router.push('/auth/login')}>
                    Aller à la connexion
                </Button>
            </div>
        );
    }

    const settingsSections = [
        {
            title: 'Compte',
            icon: User,
            items: [
                { label: 'Informations personnelles', href: '/profile/edit' },
                { label: 'Sécurité et mot de passe', href: '/profile/security' }
            ]
        },
        {
            title: 'Préférences',
            icon: Settings,
            items: [
                { label: 'Ton de l\'IA', href: '/profile/preferences' },
                { label: 'Notifications', href: '/profile/notifications' },
                { label: 'Apparence', href: '/profile/appearance' }
            ]
        },
        {
            title: 'Données',
            icon: Database,
            items: [
                { label: 'Synchronisation', href: '/profile/sync' },
                { label: 'Exporter mes données', href: '/profile/export' },
                { label: 'Supprimer mon compte', href: '/profile/delete', danger: true }
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                        Profil & <span className="text-gradient-primary">Paramètres</span>
                    </h1>
                    <p className="text-slate-400">Gérez votre compte et vos préférences</p>
                </div>

                {/* Profile Card */}
                <Card className="p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center overflow-hidden">
                            {user.avatar ? (
                                <img
                                    src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${user.avatar}`}
                                    alt={user.username}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <span className="text-3xl font-bold text-white">
                                    {(user.first_name || user.username).charAt(0).toUpperCase()}
                                </span>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-3 justify-center md:justify-start mb-2">
                                <h2 className="text-2xl font-bold">{user.first_name || user.username}</h2>
                                {user.is_premium && (
                                    <div className="px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30 flex items-center gap-1">
                                        <Crown className="w-3 h-3 text-yellow-400" />
                                        <span className="text-xs font-bold text-yellow-400">PRO</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-slate-400 mb-4">{user.email}</p>
                            <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-500">
                                <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                                    IA: {user.ai_tone || 'Standard'}
                                </span>
                                <span className="text-xs text-slate-500 ml-2">
                                    Membre depuis {new Date(user.created_at || Date.now()).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                        </div>

                        {/* Edit Button */}
                        <Button variant="secondary" onClick={() => setIsEditModalOpen(true)} className="gap-2">
                            <Edit2 className="w-4 h-4" />
                            Modifier le profil
                        </Button>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-8 border-t border-white/5">
                        <div className="text-center">
                            <p className="text-3xl font-display font-bold text-primary-400">{stats.totalTasks}</p>
                            <p className="text-xs text-slate-400 mt-1">Tâches créées</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-display font-bold text-emerald-400">{stats.completedTasks}</p>
                            <p className="text-xs text-slate-400 mt-1">Complétées</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-display font-bold text-blue-400">{stats.focusHours}h</p>
                            <p className="text-xs text-slate-400 mt-1">Focus total</p>
                        </div>
                        <div className="text-center">
                            <p className="text-3xl font-display font-bold text-orange-400">{stats.currentStreak}</p>
                            <p className="text-xs text-slate-400 mt-1">Jours de série</p>
                        </div>
                    </div>
                </Card>

                {/* Premium Upgrade (if not premium) */}
                {!user.is_premium && (
                    <Card className="p-8 mb-8 border-2 border-primary-500/30 bg-gradient-to-br from-primary-900/20 to-secondary-900/20 relative overflow-hidden">
                        {/* ... keep existing premium card content ... */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/20 rounded-full blur-[100px] -z-10"></div>
                        <div className="relative z-10">
                            <div className="flex items-start gap-4 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-yellow-500/20 flex items-center justify-center">
                                    <Crown className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-2xl font-bold mb-2">Passez à NEURIVA Pro</h3>
                                    <p className="text-slate-400">Débloquez toutes les fonctionnalités avancées</p>
                                </div>
                            </div>
                            <Link href="/premium">
                                <Button size="lg" className="w-full md:w-auto">
                                    Essayer gratuitement pendant 14 jours
                                </Button>
                            </Link>
                        </div>
                    </Card>
                )}

                {/* Settings Sections */}
                <div className="space-y-6">
                    {settingsSections.map((section, index) => (
                        <motion.div
                            key={section.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                                        <section.icon className="w-5 h-5 text-primary-400" />
                                    </div>
                                    <h3 className="text-lg font-bold">{section.title}</h3>
                                </div>
                                <div className="space-y-2">
                                    {section.items.map((item) => (
                                        <Link key={item.label} href={item.href}>
                                            <div className={`flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-colors cursor-pointer group ${item.danger ? 'hover:bg-red-500/10' : ''
                                                }`}>
                                                <span className={item.danger ? 'text-red-400' : 'text-slate-300'}>
                                                    {item.label}
                                                </span>
                                                <ChevronRight className={`w-5 h-5 ${item.danger ? 'text-red-400' : 'text-slate-500'} group-hover:translate-x-1 transition-transform`} />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Logout */}
                <div className="mt-8 mb-8">
                    <Button variant="secondary" onClick={handleLogout} className="w-full gap-2 text-red-400 hover:bg-red-500/10">
                        <LogOut className="w-4 h-4" />
                        Se déconnecter
                    </Button>
                </div>
            </div>

            {/* Edit Modal */}
            <EditProfileModal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                user={user}
                onSuccess={fetchProfileData}
            />
        </div>
    );
}
