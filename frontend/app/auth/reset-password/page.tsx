'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowRight, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';

export default function ResetPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!email) {
            setError('Email requis');
            return;
        }

        if (!/\S+@\S+\.\S+/.test(email)) {
            setError('Email invalide');
            return;
        }

        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
            setIsSuccess(true);
        }, 1500);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-background text-white flex items-center justify-center p-6 relative overflow-hidden">
                {/* Background Elements */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary-600/10 rounded-full blur-[150px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-secondary-600/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute inset-0 bg-grid opacity-[0.03]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="relative z-10 w-full max-w-md"
                >
                    <Card className="p-12 text-center">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: 'spring', delay: 0.2 }}
                            className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-6"
                        >
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </motion.div>
                        <h2 className="text-2xl font-bold mb-4">Email envoyé !</h2>
                        <p className="text-slate-400 mb-8">
                            Nous avons envoyé un lien de réinitialisation à <strong className="text-white">{email}</strong>
                        </p>
                        <p className="text-sm text-slate-500 mb-8">
                            Vérifiez votre boîte de réception et cliquez sur le lien pour réinitialiser votre mot de passe.
                        </p>
                        <Link href="/auth/login">
                            <Button size="lg" className="w-full">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Retour à la connexion
                            </Button>
                        </Link>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary-600/10 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-secondary-600/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-grid opacity-[0.03]"></div>
            </div>

            {/* Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Logo />
                        <span className="text-3xl font-bold font-display tracking-tight">NEURIVA</span>
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Mot de passe oublié ?</h1>
                    <p className="text-slate-400">Pas de souci, nous allons vous aider</p>
                </div>

                {/* Form Card */}
                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Adresse email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    value={email}
                                    onChange={(e) => {
                                        setEmail(e.target.value);
                                        setError('');
                                    }}
                                    placeholder="votre@email.com"
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${error ? 'border-red-500' : 'border-white/10'
                                        } text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors`}
                                />
                            </div>
                            {error && (
                                <p className="text-red-400 text-sm mt-2">{error}</p>
                            )}
                            <p className="text-sm text-slate-500 mt-2">
                                Entrez l'email associé à votre compte et nous vous enverrons un lien pour réinitialiser votre mot de passe.
                            </p>
                        </div>

                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-12 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Envoi en cours...
                                </>
                            ) : (
                                <>
                                    Envoyer le lien
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>
                </Card>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <Link href="/auth/login" className="text-sm text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Retour à la connexion
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
