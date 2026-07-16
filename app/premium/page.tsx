'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Check, Star, Zap, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function PremiumPage() {
    const router = useRouter();

    const features = [
        "Synchronisation illimitée entre appareils",
        "IA Personnelle avancée (Mode Coach & Zen)",
        "Statistiques détaillées et insights profonds",
        "Mode Focus illimité",
        "Support prioritaire 24/7"
    ];

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8 flex items-center justify-center">
            <div className="max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                        Passez au niveau <span className="text-gradient-primary">Supérieur</span>
                    </h1>
                    <p className="text-xl text-slate-400">
                        Libérez tout le potentiel de votre second cerveau.
                    </p>
                </motion.div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Free Plan */}
                    <Card className="p-8 border-white/5 bg-white/5 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="mb-6">
                            <h3 className="text-2xl font-bold mb-2">Gratuit</h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold">0€</span>
                                <span className="text-slate-400">/mois</span>
                            </div>
                        </div>
                        <ul className="space-y-4 mb-8">
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-primary-500" />
                                50 Tâches actives
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-primary-500" />
                                Mode Focus basique
                            </li>
                            <li className="flex items-center gap-3 text-slate-300">
                                <Check className="w-5 h-5 text-primary-500" />
                                Chat IA (limité)
                            </li>
                        </ul>
                        <Button variant="secondary" className="w-full" onClick={() => router.back()}>
                            Continuer gratuitement
                        </Button>
                    </Card>

                    {/* Pro Plan */}
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                    >
                        <Card className="p-8 border-primary-500/50 bg-gradient-to-br from-primary-900/20 to-secondary-900/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 bg-gradient-to-l from-primary-500 to-secondary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                                RECOMMANDÉ
                            </div>

                            <div className="mb-6">
                                <h3 className="text-2xl font-bold mb-2 text-white">Pro</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl font-bold text-gradient-primary">9.99€</span>
                                    <span className="text-slate-400">/mois</span>
                                </div>
                            </div>

                            <ul className="space-y-4 mb-8">
                                {features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white">
                                        <div className="w-6 h-6 rounded-full bg-primary-500/20 flex items-center justify-center">
                                            <Star className="w-3 h-3 text-primary-400" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button className="w-full bg-gradient-to-r from-primary-500 to-secondary-500 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
                                <Zap className="w-4 h-4 mr-2" />
                                Devenir Pro
                            </Button>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
