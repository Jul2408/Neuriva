'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

// Extend window type for Google Identity Services
declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (config: {
                        client_id: string;
                        callback: (response: { credential: string }) => void;
                        auto_select?: boolean;
                        cancel_on_tap_outside?: boolean;
                    }) => void;
                    renderButton: (
                        element: HTMLElement,
                        options: object
                    ) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';

export default function LoginPage() {
    const { login, loginWithGoogle } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);
    const [googleReady, setGoogleReady] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({});
    const googleBtnRef = useRef<HTMLDivElement>(null);

    // Load and initialize Google Identity Services
    useEffect(() => {
        if (!GOOGLE_CLIENT_ID) {
            console.warn('NEXT_PUBLIC_GOOGLE_CLIENT_ID not set — Google login disabled.');
            return;
        }

        const scriptId = 'google-gsi-script';
        if (document.getElementById(scriptId)) {
            initGoogle();
            return;
        }

        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.onload = () => initGoogle();
        script.onerror = () => console.error('Failed to load Google GSI script');
        document.head.appendChild(script);

        return () => {
            // Don't remove script on unmount — keep it cached
        };
    }, []);

    const initGoogle = () => {
        if (!window.google || !GOOGLE_CLIENT_ID) return;

        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleCredential,
            auto_select: false,
            cancel_on_tap_outside: true,
        });

        setGoogleReady(true);
    };

    const handleGoogleCredential = async (response: { credential: string }) => {
        setIsGoogleLoading(true);
        setErrors({});
        try {
            await loginWithGoogle(response.credential);
            // Redirect handled by AuthContext
        } catch (error: any) {
            setErrors({ general: error.message || 'Échec de la connexion avec Google.' });
            setIsGoogleLoading(false);
        }
    };

    const handleGoogleButtonClick = () => {
        if (!GOOGLE_CLIENT_ID) {
            setErrors({ general: 'Google OAuth non configuré. Ajoutez NEXT_PUBLIC_GOOGLE_CLIENT_ID.' });
            return;
        }
        if (!window.google) {
            setErrors({ general: 'Google Identity Services non chargé. Réessayez.' });
            return;
        }
        window.google.accounts.id.prompt();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined, general: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: { email?: string; password?: string } = {};
        if (!formData.email) {
            newErrors.email = 'Email requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }
        if (!formData.password) {
            newErrors.password = 'Mot de passe requis';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Minimum 6 caractères';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;
        setIsLoading(true);
        setErrors({});
        try {
            await login(formData);
        } catch (error: any) {
            setErrors({ general: error.message || 'Échec de la connexion. Vérifiez vos identifiants.' });
        } finally {
            setIsLoading(false);
        }
    };

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
                    <h1 className="text-2xl font-bold mb-2">Bon retour !</h1>
                    <p className="text-slate-400">Connectez-vous pour continuer</p>
                </div>

                {/* Form Card */}
                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    placeholder="votre@email.com"
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${errors.email ? 'border-red-500' : 'border-white/10'
                                        } text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors`}
                                />
                            </div>
                            {errors.email && (
                                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />{errors.email}
                                </p>
                            )}
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium mb-2">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${errors.password ? 'border-red-500' : 'border-white/10'
                                        } text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle className="w-3.5 h-3.5" />{errors.password}
                                </p>
                            )}
                        </div>

                        {/* Remember / Forgot */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500"
                                />
                                <span className="text-sm text-slate-400">Se souvenir de moi</span>
                            </label>
                            <Link href="/auth/reset-password" className="text-sm text-primary-400 hover:text-primary-300 transition-colors">
                                Mot de passe oublié ?
                            </Link>
                        </div>

                        {/* General Error */}
                        <AnimatePresence>
                            {errors.general && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -8 }}
                                    className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                                >
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-400 text-sm">{errors.general}</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-12 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                            disabled={isLoading || isGoogleLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Connexion...
                                </>
                            ) : (
                                <>
                                    Se connecter
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#13111C] text-slate-400">ou</span>
                        </div>
                    </div>

                    {/* Google Sign-In Button */}
                    <button
                        type="button"
                        id="google-signin-btn"
                        onClick={handleGoogleButtonClick}
                        disabled={isGoogleLoading || isLoading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl
                            bg-white text-gray-800 font-semibold text-sm
                            hover:bg-gray-50 active:bg-gray-100
                            transition-all duration-200
                            shadow-[0_2px_8px_rgba(0,0,0,0.25)]
                            hover:shadow-[0_4px_16px_rgba(0,0,0,0.35)]
                            disabled:opacity-60 disabled:cursor-not-allowed
                            border border-gray-200
                            group"
                    >
                        {isGoogleLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                                <span className="text-gray-600">Connexion en cours...</span>
                            </>
                        ) : (
                            <>
                                {/* Official Google G logo */}
                                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="group-hover:text-gray-900 transition-colors">
                                    Continuer avec Google
                                </span>
                            </>
                        )}
                    </button>

                    {/* Hidden Google-rendered button container (for renderButton fallback) */}
                    <div ref={googleBtnRef} className="hidden" />
                </Card>

                {/* Sign Up Link */}
                <p className="text-center mt-6 text-slate-400">
                    Pas encore de compte ?{' '}
                    <Link href="/auth/register" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                        Créer un compte
                    </Link>
                </p>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <Link href="/" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                        ← Retour à l&apos;accueil
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
