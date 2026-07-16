'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Key, Lock, ChevronLeft, CheckCircle, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { apiService } from '@/lib/api/apiService';

export default function SecurityPage() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const checkLogin = async () => {
        // This is a placeholder for checking login status if needed, 
        // but we assume auth based on layout protection.
    };

    // For "Forgot Password" trigger inside authenticated session
    const handleResetTrigger = async () => {
        if (!confirm('Voulez-vous recevoir un lien de réinitialisation par email ? Cela vous déconnectera.')) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.email) {
                await apiService.resetPassword(user.email);
                alert('Email envoyé ! Vous allez être déconnecté.');
                apiService.logout();
                window.location.href = '/auth/login';
            }
        } catch (e) {
            alert('Erreur lors de la demande.');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
            return;
        }

        setIsLoading(true);
        try {
            await apiService.changePassword(oldPassword, newPassword);
            setMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || 'Erreur lors du changement.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Retour au profil
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                        <Shield className="w-8 h-8 text-primary-400" />
                        Sécurité
                    </h1>
                    <p className="text-slate-400">Gérez la sécurité de votre compte</p>
                </div>

                <div className="space-y-6">
                    {/* Change Password Card */}
                    <Card className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <Key className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Mot de passe</h3>
                                <p className="text-sm text-slate-400">Dernière modification il y a 3 mois</p>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                                {message.text}
                            </div>
                        )}

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="text-sm text-slate-400 mb-1 block">Ancien mot de passe</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-slate-400 mb-1 block">Confirmer</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary-500"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <button
                                    type="button"
                                    onClick={handleResetTrigger}
                                    className="text-sm text-slate-500 hover:text-primary-400 transition-colors"
                                >
                                    Mot de passe oublié ?
                                </button>
                                <Button type="submit" disabled={isLoading} variant="primary">
                                    {isLoading ? 'Modification...' : 'Mettre à jour'}
                                </Button>
                            </div>
                        </form>
                    </Card>

                    {/* 2FA Card */}
                    <Card className="p-6 opacity-75">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                                <Lock className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Double authentification (2FA)</h3>
                                <p className="text-sm text-slate-400">Protégez votre compte avec une étape supplémentaire</p>
                            </div>
                        </div>
                        <Button variant="ghost" disabled className="w-full text-slate-500 border-dashed border">
                            Bientôt disponible
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
