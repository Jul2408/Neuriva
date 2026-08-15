'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Key, ChevronLeft, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';

export default function SecurityPage() {
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleResetTrigger = async () => {
        if (!confirm('Voulez-vous recevoir un lien de réinitialisation par email ? Cela vous déconnectera.')) return;

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            if (user.email) {
                await apiService.resetPassword(user.email);
                toast.success('Email envoyé ! Vous allez être déconnecté.');
                apiService.logout();
                window.location.href = '/auth/login';
            }
        } catch (e) {
            toast.error('Erreur lors de la demande de réinitialisation.');
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            toast.error('Les mots de passe ne correspondent pas.');
            return;
        }
        
        if (newPassword.length < 8) {
            toast.error('Le nouveau mot de passe doit contenir au moins 8 caractères.');
            return;
        }

        setIsLoading(true);
        try {
            await apiService.changePassword(oldPassword, newPassword);
            toast.success('Mot de passe modifié avec succès !');
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
            // Error is already handled by apiService interceptor (which shows a toast),
            // but we can catch it here if we want specific handling.
            toast.error(error.message || 'Erreur lors du changement de mot de passe.');
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
                        Sécurité et mot de passe
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
                                <h3 className="text-lg font-bold">Modifier le mot de passe</h3>
                                <p className="text-sm text-slate-400">Assurez-vous d'utiliser un mot de passe fort</p>
                            </div>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-2">Ancien mot de passe</label>
                                <input
                                    type="password"
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-2">Nouveau mot de passe</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-slate-300 block mb-2">Confirmer le mot de passe</label>
                                    <input
                                        type="password"
                                        className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t border-white/10 mt-6 gap-4">
                                <button
                                    type="button"
                                    onClick={handleResetTrigger}
                                    className="text-sm text-slate-400 hover:text-white transition-colors"
                                >
                                    Mot de passe oublié ?
                                </button>
                                <Button type="submit" disabled={isLoading} variant="primary" className="w-full sm:w-auto gap-2">
                                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {isLoading ? 'Modification...' : 'Mettre à jour'}
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
