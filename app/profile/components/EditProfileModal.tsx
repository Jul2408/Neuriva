import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, User as UserIcon, Camera, Loader2, Sparkles, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiService, User } from '@/lib/api/apiService';

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User; // Backend User type
    onSuccess: () => void;
}

export default function EditProfileModal({ isOpen, onClose, user, onSuccess }: EditProfileModalProps) {
    const [name, setName] = useState(user.first_name || user.username);
    const [aiTone, setAiTone] = useState(user.ai_tone || 'coach');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(user.avatar || null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Reset state when modal opens with new user data
    useEffect(() => {
        if (isOpen && user) {
            setName(user.first_name || user.username);
            setAiTone(user.ai_tone || 'coach');
            setPreviewUrl(user.avatar || null);
            setAvatarFile(null);
        }
    }, [isOpen, user]);

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
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('first_name', name);
            formData.append('ai_tone', aiTone);

            if (avatarFile) {
                formData.append('avatar', avatarFile);
            }

            // We need to implement a specialized update method for FormData in apiService
            // or modify the existing one. For now assuming apiService.updateUser can handle FormData 
            // but standard JSON patch might fail with file. 
            // Let's rely on apiService handling or fetch directly if needed.
            // Since apiService usually sends JSON, we might need a specific call here.

            await apiService.updateProfileMultipart(formData);

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update profile:', error);
            // Ideally show error toast
        } finally {
            setIsLoading(false);
        }
    };

    const tones = [
        { id: 'coach', label: 'Coach', icon: '🏆', desc: 'Motivant et direct' },
        { id: 'zen', label: 'Zen', icon: '🌿', desc: 'Calme et apaisant' },
        { id: 'robot', label: 'Analytique', icon: '🤖', desc: 'Précis et factuel' }
    ] as const;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                        onClick={onClose}
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg relative"
                        >
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] shadow-2xl">
                                {/* Header */}
                                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                                    <h2 className="text-xl font-bold flex items-center gap-2">
                                        <UserIcon className="w-5 h-5 text-primary-400" />
                                        Modifier le profil
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                                    {/* Avatar Upload */}
                                    <div className="flex flex-col items-center gap-4">
                                        <div
                                            className="relative w-32 h-32 rounded-full bg-slate-800 border-2 border-dashed border-white/20 flex items-center justify-center overflow-hidden group cursor-pointer hover:border-primary-500 transition-colors"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            {previewUrl ? (
                                                <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
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
                                        <p className="text-sm text-slate-400">Cliquez pour changer votre photo</p>
                                    </div>

                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Nom d'affichage</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50"
                                            placeholder="Votre nom"
                                        />
                                    </div>

                                    {/* AI Tone Selection */}
                                    <div className="space-y-3">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <Sparkles className="w-4 h-4 text-yellow-400" />
                                            Personnalité de l'IA
                                        </label>
                                        <div className="grid grid-cols-3 gap-3">
                                            {tones.map((tone) => (
                                                <button
                                                    key={tone.id}
                                                    type="button"
                                                    onClick={() => setAiTone(tone.id)}
                                                    className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${aiTone === tone.id
                                                        ? 'bg-primary-500/20 border-primary-500 text-white'
                                                        : 'bg-slate-900 border-white/10 text-slate-400 hover:bg-slate-800'
                                                        }`}
                                                >
                                                    <span className="text-2xl">{tone.icon}</span>
                                                    <span className="text-xs font-bold">{tone.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-center text-slate-500 mt-2">
                                            {tones.find(t => t.id === aiTone)?.desc}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            variant="secondary"
                                            className="flex-1"
                                            onClick={onClose}
                                            type="button"
                                        >
                                            Annuler
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="flex-1 gap-2"
                                            type="submit"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                            Enregistrer
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
