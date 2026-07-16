'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { CheckCircle2, Clock, ArrowRight, Trash2, Plus } from 'lucide-react';
import { apiService } from '@/lib/api/apiService';

interface Task {
    id: string;
    title: string;
    estimated_duration?: number;
    priority_label?: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
}

interface NextActionsProps {
    tasks?: Task[];
    onAddTask: () => void;
    onTaskUpdate: () => void;
}

export default function NextActions({ tasks = [], onAddTask, onTaskUpdate }: NextActionsProps) {
    const [deletingId, setDeletingId] = React.useState<string | null>(null);

    const handleDelete = async (e: React.MouseEvent, taskId: string) => {
        e.stopPropagation();
        if (confirm('Voulez-vous vraiment supprimer cette tâche ?')) {
            setDeletingId(taskId);
            try {
                await apiService.deleteTask(taskId);
                onTaskUpdate();
            } catch (error) {
                console.error('Failed to delete task', error);
                alert('Erreur lors de la suppression');
            } finally {
                setDeletingId(null);
            }
        }
    };

    const priorityColors: Record<string, string> = {
        low: 'text-slate-400',
        medium: 'text-blue-400',
        high: 'text-orange-400',
        urgent: 'text-red-400'
    };

    return (
        <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Prochaines actions</h3>
                <button
                    onClick={onAddTask}
                    className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center gap-1"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter
                </button>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {tasks.map((task, index) => (
                        <motion.div
                            key={task.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: deletingId === task.id ? 0.5 : 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.1 }}
                            className="group p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-primary-500/30 transition-all cursor-pointer relative"
                        >
                            <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <div className="mt-0.5" onClick={(e) => handleDelete(e, task.id)}>
                                    {/* Using handleDelete as a temporary complete action for now, user asked for remove */}
                                    <div className="w-5 h-5 rounded-full border-2 border-white/20 group-hover:border-primary-500 transition-colors flex items-center justify-center hover:bg-primary-500/20">
                                        <div className="w-2 h-2 rounded-full bg-transparent transition-colors"></div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium text-white mb-1 group-hover:text-primary-300 transition-colors">
                                        {task.title}
                                    </h4>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <div className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            <span>{task.estimated_duration || 30} min</span>
                                        </div>
                                        {task.priority_label && (
                                            <div className={`font-bold uppercase ${priorityColors[task.priority_label] || 'text-slate-400'}`}>
                                                {task.priority_label}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Delete Action */}
                                <button
                                    onClick={(e) => handleDelete(e, task.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 hover:bg-red-500/20 rounded-full transition-all text-slate-400 hover:text-red-400"
                                    title="Supprimer"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty state (if no tasks) */}
            {tasks.length === 0 && (
                <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
                    <p className="text-slate-400">Aucune tâche en attente</p>
                    <Button
                        variant="secondary"
                        size="sm"
                        className="mt-4"
                        onClick={onAddTask}
                    >
                        Créer une tâche
                    </Button>
                </div>
            )}
        </Card>
    );
}
