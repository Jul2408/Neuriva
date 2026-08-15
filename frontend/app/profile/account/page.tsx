'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, User as UserIcon, Loader2, Save, ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { apiService, User } from '@/lib/api/apiService';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const userData = await apiService.getCurrentUser();
                setUser(userData);
                setName(userData.first_name || userData.username);
                setPreviewUrl(userData.avatar || null);
            } catch (error) {
                toast.error("Impossible de charger les informations du profil");
                router.push('/auth/login');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUser();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('first_name', name);

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            await apiService.updateProfileMultipart(formData);
            toast.success("Profil mis à jour avec succès");
            // Optional: router.push('/profile');
        } catch (error: any) {
            toast.error(error.message || "Erreur lors de la mise à jour du profil");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background text-white p-6 md:p-8 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Retour au profil
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                        <UserIcon className="w-8 h-8 text-primary-400" />
                        Informations personnelles
                    </h1>
                    <p className="text-slate-400">Gérez votre identité sur NEURIVA</p>
                </div>

                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center gap-4 py-4">
                            <div
                                className="relative w-32 h-32 rounded-full bg-slate-800 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary-500 transition-colors"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                {previewUrl ? (
                                    <img src={previewUrl.startsWith('http') ? previewUrl : `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '')}${previewUrl}`} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon className="w-12 h-12 text-slate-500" />
                                )}

                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                    <Camera className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <div className="text-center">
                                <p className="font-medium text-white">Photo de profil</p>
                                <p className="text-sm text-slate-400">Cliquez pour modifier (JPG, PNG)</p>
                            </div>
                        </div>

                        {/* Form Fields */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-2">Nom d'affichage</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500 transition-colors"
                                    placeholder="Votre nom"
                                    required
                                />
                            </div>
                            
                            <div>
                                <label className="text-sm font-medium text-slate-300 block mb-2">Adresse Email</label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    className="w-full bg-slate-900/50 border border-white/5 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                                />
                                <p className="text-xs text-slate-500 mt-1">L'adresse email ne peut pas être modifiée directement.</p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex justify-end pt-4 border-t border-white/10">
                            <Button type="submit" variant="primary" disabled={isSaving} className="gap-2">
                                {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                Enregistrer les modifications
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        </div>
    );
}
