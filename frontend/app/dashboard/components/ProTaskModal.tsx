'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Calendar, Clock, AlertTriangle, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiService } from '@/lib/api/apiService';

interface ProTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (updatedTask: any) => void; // retourne la tâche créée ou modifiée
    initialTask?: any | null;
}

export default function ProTaskModal({ isOpen, onClose, onSuccess, initialTask }: ProTaskModalProps) {
    const [title, setTitle] = React.useState('');
    const [duration, setDuration] = React.useState(30);
    const [priority, setPriority] = React.useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
    const [dueDate, setDueDate] = React.useState('');
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    // Calcule la date/heure minimum dynamiquement (recalculé à chaque rendu)
    // pour empêcher de choisir une date/heure passée
    const getMinDateTime = () => {
        const now = new Date();
        now.setSeconds(0, 0);
        return now.toISOString().slice(0, 16);
    };

    // Recalculé à chaque ouverture du modal
    const [minDateTime, setMinDateTime] = React.useState(getMinDateTime);
    React.useEffect(() => {
        if (isOpen) {
            setMinDateTime(getMinDateTime());
            if (initialTask) {
                setTitle(initialTask.title || initialTask.name || '');
                setDuration(initialTask.estimatedTime || initialTask.estimated_duration || 30);
                setPriority(initialTask.priority || initialTask.priority_label || 'medium');
                
                if (initialTask.dueDate || initialTask.due_date) {
                    const dateObj = new Date(initialTask.dueDate || initialTask.due_date);
                    // Format attendu par datetime-local: YYYY-MM-DDTHH:MM
                    const formattedDate = new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                    setDueDate(formattedDate);
                } else {
                    setDueDate('');
                }
            } else {
                // Mode création
                setTitle('');
                setDuration(30);
                setPriority('medium');
                setDueDate('');
            }
        }
    }, [isOpen, initialTask]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const taskData: any = {
                title,
                estimated_duration: duration,
                priority_label: priority,
            };

            // On ne modifie le statut que si c'est une création
            if (!initialTask) {
                taskData.status = 'todo';
            }

            if (dueDate) {
                taskData.due_date = new Date(dueDate).toISOString();
            }

            let result: any;
            if (initialTask) {
                result = await apiService.updateTask(initialTask.id, taskData);
            } else {
                result = await apiService.createTask(taskData);
            }

            // Planifier une alarme persistante via Service Worker (fonctionne hors ligne)
            if (dueDate && 'serviceWorker' in navigator) {
                try {
                    // Demander la permission de notification si pas encore accordée
                    if (Notification.permission === 'default') {
                        await Notification.requestPermission();
                    }

                    if (Notification.permission === 'granted') {
                        const reg = await navigator.serviceWorker.ready;
                        const dueTs = new Date(dueDate).getTime();

                        // Envoyer l'alarme au SW qui la stocke dans la Cache API
                        // → persistante même si l'app est fermée ou le téléphone redémarre
                        reg.active?.postMessage({
                            type: 'SCHEDULE_ALARM',
                            payload: {
                                alarms: [{ title, dueTs, notified5: false, notifiedNow: false }]
                            }
                        });
                    }
                } catch (swErr) {
                    console.warn('[ProTaskModal] Impossible de planifier l\'alarme SW:', swErr);
                }
            }

            // Reset form géré par useEffect
            onSuccess(result); // Passe le résultat au parent pour mise à jour optimiste
            onClose();
        } catch (err: any) {
            console.error('Task error:', err);
            setError(err.message || (initialTask ? 'Impossible de modifier la tâche' : 'Impossible de créer la tâche'));
        } finally {
            setIsSubmitting(false);
        }
    };

    const priorities = [
        { id: 'low', label: 'Basse', color: 'bg-slate-500', selectedRing: 'ring-slate-400' },
        { id: 'medium', label: 'Moyenne', color: 'bg-blue-500', selectedRing: 'ring-blue-400' },
        { id: 'high', label: 'Haute', color: 'bg-orange-500', selectedRing: 'ring-orange-400' },
        { id: 'urgent', label: 'Urgente', color: 'bg-red-500', selectedRing: 'ring-red-400' },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    >
                        {/* Modal — slide up sur mobile, scale sur desktop */}
                        <motion.div
                            initial={{ opacity: 0, y: 80, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 80, scale: 0.97 }}
                            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full sm:max-w-lg relative max-h-[95vh] flex flex-col"
                        >
                            {/* Conteneur principal — thème adaptatif (light/dark via CSS vars) */}
                            <div className="relative flex flex-col overflow-hidden rounded-t-3xl sm:rounded-2xl border border-foreground/10 bg-background shadow-2xl p-4 sm:p-6 max-h-full">

                                {/* Glows décoratifs */}
                                <div className="absolute -top-16 -right-16 w-48 h-48 bg-primary-500/15 rounded-full blur-[60px] pointer-events-none" />
                                <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-secondary-500/15 rounded-full blur-[60px] pointer-events-none" />

                                {/* Poignée mobile */}
                                <div className="sm:hidden w-10 h-1 rounded-full bg-foreground/20 mx-auto mb-4" />

                                {/* Header */}
                                <div className="flex items-center justify-between mb-4 sm:mb-5 relative shrink-0">
                                    <h2 className="text-xl font-bold font-display flex items-center gap-2 text-foreground">
                                        <Zap className="w-5 h-5 text-primary-400" />
                                        {initialTask ? 'Modifier la tâche' : 'Nouvelle Tâche'}
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="p-2 rounded-full hover:bg-foreground/10 transition-colors"
                                    >
                                        <X className="w-5 h-5 text-slate-400" />
                                    </button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 relative overflow-y-auto pr-2 pb-2 custom-scrollbar flex-1">

                                    {/* Titre */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-400">
                                            Que devez-vous accomplir ?
                                        </label>
                                        <input
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="Ex: Rédiger le rapport mensuel..."
                                            className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-4 py-3 text-foreground placeholder:text-slate-500 focus:outline-none focus:border-primary-500/60 focus:ring-1 focus:ring-primary-500/40 transition-all font-medium"
                                            autoFocus
                                            required
                                        />
                                    </div>

                                    {/* Priorité */}
                                    <div className="space-y-1.5">
                                        <label className="text-sm font-medium text-slate-400">Priorité</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {priorities.map((p) => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => setPriority(p.id as any)}
                                                    className={`py-2 px-1 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                                                        priority === p.id
                                                            ? `${p.color} text-white shadow-md scale-105 ring-2 ${p.selectedRing}`
                                                            : 'bg-foreground/5 text-slate-400 hover:bg-foreground/10'
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Durée + Échéance */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {/* Durée */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                                                <Clock className="w-3.5 h-3.5 text-primary-400 shrink-0" />
                                                Durée (min)
                                            </label>
                                            <input
                                                type="number"
                                                value={duration}
                                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)}
                                                min="5"
                                                step="5"
                                                className="w-full bg-foreground/5 border border-foreground/10 rounded-xl px-3 py-3 text-foreground focus:outline-none focus:border-primary-500/60 transition-all text-sm"
                                            />
                                        </div>

                                        {/* Échéance — responsive, pas de débordement sur mobile */}
                                        <div className="space-y-1.5">
                                            <label className="text-sm font-medium text-slate-400 flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-secondary-400 shrink-0" />
                                                Échéance
                                            </label>
                                            <input
                                                type="datetime-local"
                                                value={dueDate}
                                                onChange={(e) => setDueDate(e.target.value)}
                                                min={minDateTime}
                                                className="w-full min-w-0 bg-foreground/5 border border-foreground/10 rounded-xl px-2 py-3 text-foreground focus:outline-none focus:border-secondary-500/60 transition-all text-xs"
                                                style={{ colorScheme: 'light dark' }}
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                                            <AlertTriangle className="w-4 h-4 shrink-0" />
                                            {error}
                                        </div>
                                    )}

                                    {/* Bouton */}
                                    <Button
                                        type="submit"
                                        className="w-full py-5 font-bold text-base shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_30px_rgba(139,92,246,0.4)]"
                                        disabled={isSubmitting || !title.trim()}
                                    >
                                        {isSubmitting ? (
                                            <span className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                {initialTask ? 'Modification...' : 'Création...'}
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-2">
                                                <Check className="w-5 h-5" />
                                                {initialTask ? 'Enregistrer' : 'Créer la tâche'}
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
