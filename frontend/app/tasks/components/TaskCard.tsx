'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { Clock, AlertTriangle, CheckCircle2, ArrowRight, Tag } from 'lucide-react';

export interface Task {
    id: string;
    title: string;
    description: string;
    estimatedTime: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    riskLevel: 'none' | 'low' | 'medium' | 'high';
    status: 'todo' | 'in_progress' | 'done';
    dueDate: Date | null;
    tags: string[];
}

interface TaskCardProps {
    task: Task;
    index: number;
    onToggle: () => void;
}

import { apiService } from '@/lib/api/apiService';
import { CalendarClock } from 'lucide-react';

export default function TaskCard({ task, index, onToggle }: TaskCardProps) {
    // ... existing configs ...
    const priorityConfig = {
        low: { color: 'text-slate-400', bg: 'bg-slate-500/20' },
        medium: { color: 'text-blue-400', bg: 'bg-blue-500/20' },
        high: { color: 'text-orange-400', bg: 'bg-orange-500/20' },
        urgent: { color: 'text-red-400', bg: 'bg-red-500/20' }
    };

    const riskConfig = {
        none: null,
        low: { color: 'text-yellow-400', label: 'Risque faible' },
        medium: { color: 'text-orange-400', label: 'Risque moyen' },
        high: { color: 'text-red-400', label: 'Risque élevé' }
    };

    const config = priorityConfig[task.priority];
    const risk = riskConfig[task.riskLevel];

    const formatDateTime = (date: Date | null) => {
        if (!date) return '';
        return new Intl.DateTimeFormat('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    };

    const handlePostpone = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!task.dueDate) return;

        // Add 24 hours
        const newDate = new Date(task.dueDate.getTime() + 24 * 60 * 60 * 1000);

        try {
            await apiService.updateTask(task.id, { due_date: newDate.toISOString() });
            window.location.reload(); // Simple reload for now to reflect changes, optimally should use a callback
        } catch (error) {
            alert("Erreur lors du report de la tâche");
        }
    };

    const timeLeft = task.dueDate ? formatDateTime(task.dueDate) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
        >
            <Card className={`p-5 group hover:border-primary-500/30 transition-all cursor-pointer ${task.status === 'done' ? 'opacity-50' : ''}`}>
                <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                        onClick={onToggle}
                        className="mt-1 w-6 h-6 rounded-full border-2 border-white/20 hover:border-primary-500 transition-all flex items-center justify-center group-hover:scale-110"
                    >
                        {task.status === 'done' && (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        )}
                        {task.status === 'in_progress' && (
                            <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                        )}
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                            <h3 className={`font-bold text-lg ${task.status === 'done' ? 'line-through text-slate-500' : 'text-white'}`}>
                                {task.title}
                            </h3>
                            {risk && (
                                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10">
                                    <AlertTriangle className={`w-3 h-3 ${risk.color}`} />
                                </div>
                            )}
                        </div>

                        {task.description && (
                            <p className="text-sm text-slate-400 mb-3">{task.description}</p>
                        )}

                        {/* Meta */}
                        <div className="flex flex-wrap items-center gap-4 text-xs">
                            <div className="flex items-center gap-1 text-slate-400">
                                <Clock className="w-3 h-3" />
                                <span>{task.estimatedTime} min</span>
                            </div>

                            {timeLeft && (
                                <div className={`flex items-center gap-1 ${task.dueDate && task.dueDate.getTime() - Date.now() < 4 * 60 * 60 * 1000 ? 'text-red-400' : 'text-slate-400'}`}>
                                    <span className="font-mono bg-white/5 px-2 py-0.5 rounded">{timeLeft}</span>
                                </div>
                            )}

                            <div className={`px-2 py-1 rounded-full ${config.bg} ${config.color} font-bold uppercase`}>
                                {task.priority}
                            </div>

                            {task.tags.map(tag => (
                                <div key={tag} className="flex items-center gap-1 text-slate-500">
                                    <Tag className="w-3 h-3" />
                                    <span>{tag}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={handlePostpone}
                            className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"
                            title="Reporter à demain (+24h)"
                        >
                            <CalendarClock className="w-5 h-5" />
                        </button>
                        <ArrowRight className="w-5 h-5 text-primary-400" />
                    </div>
                </div>
            </Card>
        </motion.div>
    );
}
