'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';
import Link from 'next/link';
import { useAuth } from '@/lib/context/AuthContext';

export default function RegisterPage() {
    const { register } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
        general?: string;
    }>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (errors[name as keyof typeof errors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors: typeof errors = {};

        if (!formData.name) {
            newErrors.name = 'Nom requis';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Minimum 2 caractères';
        }

        if (!formData.email) {
            newErrors.email = 'Email requis';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }

        if (!formData.password) {
            newErrors.password = 'Mot de passe requis';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Minimum 8 caractères';
        } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
            newErrors.password = 'Doit contenir majuscule, minuscule et chiffre';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Confirmation requise';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
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
            const { name, email, password } = formData;
            await register({ name, email, password });
            // Redirect handled by AuthContext
        } catch (error: any) {
            setErrors({ general: error.message || 'Échec de l\'inscription. Veuillez réessayer.' });
        } finally {
            setIsLoading(false);
        }
    };

    const passwordStrength = () => {
        const password = formData.password;
        if (!password) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[^a-zA-Z\d]/.test(password)) strength++;

        if (strength <= 2) return { strength, label: 'Faible', color: 'bg-red-500' };
        if (strength <= 3) return { strength, label: 'Moyen', color: 'bg-yellow-500' };
        if (strength <= 4) return { strength, label: 'Bon', color: 'bg-blue-500' };
        return { strength, label: 'Excellent', color: 'bg-emerald-500' };
    };

    const strength = passwordStrength();

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
                    <h1 className="text-2xl font-bold mb-2">Créez votre compte</h1>
                    <p className="text-slate-400">Commencez votre voyage vers la productivité</p>
                </div>

                {/* Form Card */}
                <Card className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium mb-2">
                                Nom complet
                            </label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    placeholder="Thomas Laurent"
                                    className={`w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border ${errors.name ? 'border-red-500' : 'border-white/10'
                                        } text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors`}
                                />
                            </div>
                            {errors.name && (
                                <p className="text-red-400 text-sm mt-2">{errors.name}</p>
                            )}
                        </div>

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
                                <p className="text-red-400 text-sm mt-2">{errors.email}</p>
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
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.password && (
                                <p className="text-red-400 text-sm mt-2">{errors.password}</p>
                            )}

                            {/* Password Strength */}
                            {formData.password && !errors.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div
                                                key={i}
                                                className={`h-1 flex-1 rounded-full transition-colors ${i <= strength.strength ? strength.color : 'bg-white/10'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-xs text-slate-400">
                                        Force: <span className={strength.color.replace('bg-', 'text-')}>{strength.label}</span>
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                                Confirmer le mot de passe
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="••••••••"
                                    className={`w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border ${errors.confirmPassword ? 'border-red-500' : 'border-white/10'
                                        } text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                                >
                                    {showConfirmPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-400 text-sm mt-2">{errors.confirmPassword}</p>
                            )}
                            {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                                <p className="text-emerald-400 text-sm mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    Les mots de passe correspondent
                                </p>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="flex items-start gap-2">
                            <input
                                type="checkbox"
                                id="terms"
                                required
                                className="w-4 h-4 mt-1 rounded border-white/10 bg-white/5 text-primary-500 focus:ring-primary-500"
                            />
                            <label htmlFor="terms" className="text-sm text-slate-400">
                                J'accepte les{' '}
                                <Link href="/legal/terms" className="text-primary-400 hover:text-primary-300">
                                    conditions d'utilisation
                                </Link>{' '}
                                et la{' '}
                                <Link href="/legal/privacy" className="text-primary-400 hover:text-primary-300">
                                    politique de confidentialité
                                </Link>
                            </label>
                        </div>

                        {/* General Error */}
                        {errors.general && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                                <p className="text-red-400 text-sm">{errors.general}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-12 shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Création du compte...
                                </>
                            ) : (
                                <>
                                    Créer mon compte
                                    <ArrowRight className="w-5 h-5 ml-2" />
                                </>
                            )}
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#13111C] text-slate-400">ou</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <button className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuer avec Google
                    </button>
                </Card>

                {/* Login Link */}
                <p className="text-center mt-6 text-slate-400">
                    Déjà un compte ?{' '}
                    <Link href="/auth/login" className="text-primary-400 hover:text-primary-300 font-medium transition-colors">
                        Se connecter
                    </Link>
                </p>

                {/* Back to Home */}
                <div className="text-center mt-8">
                    <Link href="/" className="text-sm text-slate-500 hover:text-slate-400 transition-colors">
                        ← Retour à l'accueil
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
