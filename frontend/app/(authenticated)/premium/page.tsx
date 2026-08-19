'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import {
    Check, Star, Zap, Shield, Brain, TrendingUp, Mic,
    BarChart3, Palette, ChevronRight, Crown
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';

const FREE_FEATURES = [
    { icon: Check, label: 'Jusqu\'à 50 tâches actives' },
    { icon: Check, label: 'Mode Focus basique (25 min)' },
    { icon: Check, label: 'Chat IA (50 messages/jour)' },
    { icon: Check, label: 'Statistiques de base' },
    { icon: Check, label: 'Notifications d\'échéance' },
];

const PRO_FEATURES = [
    { icon: Brain, label: 'Connexion prioritaire à Gemini 2.5 Pro', highlight: true },
    { icon: Mic, label: 'Voix IA premium (synthèse naturelle)', highlight: true },
    { icon: BarChart3, label: 'Statistiques illimitées & insights avancés', highlight: false },
    { icon: Zap, label: 'Tâches, Focus et Chat illimités', highlight: false },
    { icon: Palette, label: 'Thèmes exclusifs et personnalisation avancée', highlight: false },
    { icon: TrendingUp, label: 'Analyse comportementale approfondie', highlight: false },
    { icon: Shield, label: 'Support prioritaire 24/7', highlight: false },
    { icon: Star, label: 'Accès anticipé aux nouvelles fonctionnalités', highlight: false },
];

const COMPARISON = [
    { feature: 'Tâches actives', free: '50 max', pro: 'Illimité' },
    { feature: 'Messages IA / jour', free: '50', pro: 'Illimité' },
    { feature: 'Modèle IA', free: 'Gemini Flash', pro: 'Gemini 2.5 Pro' },
    { feature: 'Sessions Focus', free: 'Basique', pro: 'Illimitées' },
    { feature: 'Statistiques', free: '7 jours', pro: 'Historique complet' },
    { feature: 'Voix IA', free: 'Non', pro: 'Oui (Premium)' },
    { feature: 'Thèmes exclusifs', free: 'Non', pro: 'Oui (8 thèmes)' },
    { feature: 'Export de données', free: 'CSV basique', pro: 'PDF + CSV + API' },
];

export default function PremiumPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');

    const monthlyPrice = 9.99;
    const yearlyPrice = 6.99;
    const currentPrice = billingCycle === 'yearly' ? yearlyPrice : monthlyPrice;
    const savings = Math.round(((monthlyPrice - yearlyPrice) / monthlyPrice) * 100);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.08 } }
    };
    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="text-center mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-300 text-sm font-medium mb-6">
                        <Crown className="w-4 h-4" />
                        NEURIVA Pro
                    </div>
                    <h1 className="text-4xl md:text-6xl font-display font-bold mb-4 leading-tight">
                        Votre cerveau mérite le{' '}
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-secondary-400 to-primary-300">
                            meilleur
                        </span>
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        Passez à NEURIVA Pro et accédez à l'IA la plus puissante,
                        aux statistiques illimitées et à une expérience sans friction.
                    </p>
                </motion.div>

                {/* Billing Toggle */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center justify-center gap-4 mb-10"
                >
                    <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
                        Mensuel
                    </span>
                    <button
                        onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}
                        className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === 'yearly' ? 'bg-primary-500' : 'bg-white/10'}`}
                    >
                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${billingCycle === 'yearly' ? 'translate-x-8' : 'translate-x-1'}`} />
                    </button>
                    <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
                        Annuel
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                            -{savings}%
                        </span>
                    </span>
                </motion.div>

                {/* Pricing Cards */}
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="show"
                    className="grid md:grid-cols-2 gap-6 mb-14"
                >
                    {/* Free Plan */}
                    <motion.div variants={itemVariants}>
                        <Card className="p-8 h-full flex flex-col">
                            <div className="mb-6">
                                <h3 className="text-xl font-bold mb-1 text-slate-300">Gratuit</h3>
                                <div className="flex items-baseline gap-1 mb-3">
                                    <span className="text-5xl font-display font-bold">0€</span>
                                    <span className="text-slate-500">/mois</span>
                                </div>
                                <p className="text-sm text-slate-500">Pour découvrir NEURIVA</p>
                            </div>
                            <ul className="space-y-3 mb-8 flex-1">
                                {FREE_FEATURES.map((f, i) => (
                                    <li key={i} className="flex items-center gap-3 text-slate-400 text-sm">
                                        <f.icon className="w-4 h-4 text-slate-500 shrink-0" />
                                        {f.label}
                                    </li>
                                ))}
                            </ul>
                            {user?.is_premium ? (
                                <Button variant="secondary" className="w-full" disabled>
                                    Plan actuel : Pro
                                </Button>
                            ) : (
                                <Button variant="secondary" className="w-full" onClick={() => router.back()}>
                                    Continuer gratuitement
                                </Button>
                            )}
                        </Card>
                    </motion.div>

                    {/* Pro Plan */}
                    <motion.div variants={itemVariants} whileHover={{ scale: 1.01 }}>
                        <div className="relative h-full">
                            {/* Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-secondary-500/20 rounded-2xl blur-xl" />
                            <Card className="p-8 border-primary-500/50 bg-gradient-to-br from-primary-950/60 to-secondary-950/60 relative overflow-hidden h-full flex flex-col">
                                {/* Badge */}
                                <div className="absolute top-0 right-0 bg-gradient-to-l from-primary-500 to-secondary-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl tracking-wider">
                                    RECOMMANDÉ
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Crown className="w-5 h-5 text-primary-400" />
                                        <h3 className="text-xl font-bold text-white">Pro</h3>
                                    </div>
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
                                            {currentPrice.toFixed(2)}€
                                        </span>
                                        <span className="text-slate-400">/mois</span>
                                    </div>
                                    {billingCycle === 'yearly' && (
                                        <p className="text-sm text-emerald-400">
                                            Soit {(yearlyPrice * 12).toFixed(2)}€/an — économisez {((monthlyPrice - yearlyPrice) * 12).toFixed(2)}€
                                        </p>
                                    )}
                                </div>

                                <ul className="space-y-3 mb-8 flex-1">
                                    {PRO_FEATURES.map((f, i) => (
                                        <li key={i} className={`flex items-center gap-3 text-sm ${f.highlight ? 'text-white font-medium' : 'text-slate-300'}`}>
                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${f.highlight ? 'bg-primary-500/30 text-primary-400' : 'bg-white/5 text-slate-400'}`}>
                                                <f.icon className="w-3.5 h-3.5" />
                                            </div>
                                            {f.label}
                                        </li>
                                    ))}
                                </ul>

                                {user?.is_premium ? (
                                    <Button className="w-full h-14 text-base font-bold" disabled>
                                        <Crown className="w-5 h-5 mr-2" />
                                        Vous êtes déjà Pro
                                    </Button>
                                ) : (
                                    <Button className="w-full h-14 text-base font-bold shadow-[0_0_40px_rgba(139,92,246,0.35)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)] transition-shadow">
                                        <Zap className="w-5 h-5 mr-2" />
                                        Passer à Pro
                                        <ChevronRight className="w-5 h-5 ml-auto" />
                                    </Button>
                                )}
                            </Card>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-2xl font-display font-bold text-center mb-6">
                        Comparaison détaillée
                    </h2>
                    <Card className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/5">
                                        <th className="text-left p-4 text-slate-400 font-medium text-sm">Fonctionnalité</th>
                                        <th className="text-center p-4 text-slate-400 font-medium text-sm">Gratuit</th>
                                        <th className="text-center p-4 text-primary-400 font-bold text-sm">
                                            <span className="flex items-center justify-center gap-1.5">
                                                <Crown className="w-4 h-4" /> Pro
                                            </span>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {COMPARISON.map((row, i) => (
                                        <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors">
                                            <td className="p-4 text-sm text-white">{row.feature}</td>
                                            <td className="p-4 text-center text-sm text-slate-400">{row.free}</td>
                                            <td className="p-4 text-center text-sm font-semibold text-primary-300">{row.pro}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </motion.div>

                {/* Footer CTA */}
                {!user?.is_premium && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center mt-10"
                    >
                        <p className="text-slate-500 text-sm">
                            Essai sans engagement. Annulation à tout moment.
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
