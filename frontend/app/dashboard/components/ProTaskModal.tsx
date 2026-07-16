'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar, Clock, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiService } from '@/lib/api/apiService';

interface ProTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ProTaskModal({ isOpen, onClose, onSuccess }: ProTaskModalProps) {
    const [title, setTitle] = React.useState('');
    const [duration, setDuration] = React.useState(30);
    const [priority, setPriority] = React.useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [dueDate, setDueDate] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await apiService.createTask({
                title,
                estimated_duration: duration,
                priority_label: priority,
                due_date: dueDate ? new Date(dueDate).toISOString() : null,
                status: 'todo'
            });

            // Reset form
            setTitle('');
            setDuration(30);
            setPriority('medium');
            setDueDate('');

            onSuccess();
            onClose();
        } catch (err: any) {
            console.error('Task creation error:', err);
            setError(err.message || "Impossible de créer la tâche");
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorities = [
        { id: 'low', label: 'Basse', color: 'bg-slate-500', hover: 'hover:bg-slate-600' },
        { id: 'medium', label: 'Moyenne', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
        { id: 'high', label: 'Haute', color: 'bg-orange-500', hover: 'hover:bg-orange-600' },
        { id: 'urgent', label: 'Urgente', color: 'bg-red-500', hover: 'hover:bg-red-600' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop and Container */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
                        onClick={onClose}
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-lg relative"
                        >
                            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0F172A] p-6 shadow-2xl">
                                {/* Glow effects */}
                                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-500/20 rounded-full blur-[80px] pointer-events-none" />
                                <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-secondary-500/20 rounded-full blur-[80px] pointer-events-none" />

                                {/* Header */}
                                <div className="flex items-center justify-between mb-6 relative">
                                    <h2 className="text-2xl font-bold font-display flex items-center gap-2">
                                        <Zap className="w-6 h-6 text-primary-400" />
                                        Nouvelle Tâche
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6 relative">
                                    {/* Title Input */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Que devez-vous accomplir ?</label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ex: Rédiger le rapport mensuel..."
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all font-medium"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    {/* Priority Selection */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-slate-300">Priorité</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {priorities.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => setPriority(p.id as any)}
                                                    className={`
                                                    py-2 px-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                                                    ${priority === p.id
                                                            ? `${p.color} text-white shadow-lg scale-105`
                                                            : 'bg-white/5 text-slate-400 hover:bg-white/10'
                                                        }
                                                `}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Details Grid */}
                                    <div className="grid grid-cols-2 gap-4">
                                        {/* Duration */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary-400" />
                                                Durée (min)
                                            </label>
                                            <input
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                                min="5"
                                                step="5"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-all"
                                            />
                                        </div>

                                        {/* Due Date */}
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-secondary-400" />
                                                Échéance
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary-500/50 transition-all text-sm"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                                            <AlertTriangle className="w-4 h-4" />
                                            {error}
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full py-6 font-bold text-lg shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                                        disabled={isSubmitting || !title.trim()}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Création...
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Check className="w-5 h-5" />
                                                Créer la tâche
                                            </span>
                                        )}
                                    </Button>
                                </form>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
