'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Clock, AlertTriangle, CheckCircle2, Circle } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import ProTaskModal from '../dashboard/components/ProTaskModal';
import TaskCard, { Task } from './components/TaskCard';
import TaskFilters from './components/TaskFilters';
import { apiService } from '@/lib/api/apiService';

// ... (keep existing imports)

// Mock data (renamed to avoid conflict if needed, though we fetch real data now)
const mockTasks: Task[] = [];

export default function TasksPage() {
    // ... (keep state)
    const [tasks, setTasks] = useState<Task[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'urgent' | 'completed'>('all');
    const [showTaskModal, setShowTaskModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);

    // ... (keep useEffect and fetchTasks)
    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const response = await apiService.getTasks();
            const data = response.results || response; // Handle pagination (Django DRF returns { results: [...] })

            if (!Array.isArray(data)) {
                console.error('Expected array of tasks but got:', data);
                setTasks([]);
                return;
            }

            // Transform backend data to frontend Task interface
            const formattedTasks: Task[] = data.map((t: any) => ({
                id: t.id,
                title: t.title,
                description: t.description,
                estimatedTime: t.estimated_duration,
                priority: t.priority_label,
                riskLevel: t.risk_level,
                status: t.status,
                dueDate: t.due_date ? new Date(t.due_date) : null,
                tags: t.tags || []
            }));
            setTasks(formattedTasks);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTaskCreated = (result: any) => {
        if (!result) {
            // Fallback : si result est vide, refetch
            fetchTasks();
            return;
        }
        // Transformation du résultat backend au format frontend Task
        const updatedTask: Task = {
            id: result.id,
            title: result.title,
            description: result.description,
            estimatedTime: result.estimated_duration,
            priority: result.priority_label,
            riskLevel: result.risk_level,
            status: result.status,
            dueDate: result.due_date ? new Date(result.due_date) : null,
            tags: result.tags || []
        };

        setTasks(prev => {
            const exists = prev.some(t => t.id === updatedTask.id);
            if (exists) {
                // Mise à jour de la tâche existante (mode édition)
                return prev.map(t => t.id === updatedTask.id ? updatedTask : t);
            }
            // Ajout de la nouvelle tâche en haut de la liste
            return [updatedTask, ...prev];
        });

        // Refetch silencieux en arrière-plan pour garder la synchro
        fetchTasks();
    };

    const handleToggleTask = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;

        const newStatus = task.status === 'done' ? 'todo' : 'done';

        // Optimistic update
        setTasks(tasks.map(t =>
            t.id === id ? { ...t, status: newStatus as any } : t
        ));

        try {
            await apiService.updateTask(id, { status: newStatus });
        } catch (error) {
            console.error('Error updating task:', error);
            // Revert on error
            setTasks(tasks);
        }
    };

    const filteredTasks = tasks.filter(task => {
        // Search filter
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Status filter
        if (activeFilter === 'completed' && task.status !== 'done') return false;
        if (activeFilter === 'urgent' && task.priority !== 'urgent') return false;
        if (activeFilter === 'today') {
            const today = new Date();
            if (!task.dueDate || task.dueDate.getDate() !== today.getDate()) return false;
        }

        // Hide done tasks unless specifically requested
        if (activeFilter !== 'completed' && task.status === 'done') return false;

        return true;
    });

    const stats = {
        total: tasks.filter(t => t.status !== 'done').length,
        completed: tasks.filter(t => t.status === 'done').length,
        urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length,
        atRisk: tasks.filter(t => (t.riskLevel === 'high' || t.riskLevel === 'medium') && t.status !== 'done').length
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background p-6 md:p-8">
                {/* Header Skeleton */}
                <div className="mb-8 space-y-3 w-full max-w-md">
                    <div className="h-10 bg-white/5 rounded-xl w-1/2 animate-pulse"></div>
                    <div className="h-4 bg-white/5 rounded-lg w-1/3 animate-pulse"></div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-20 bg-white/5 rounded-xl animate-pulse"></div>
                    ))}
                </div>

                {/* Search & Filters Skeleton */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 h-12 bg-white/5 rounded-xl animate-pulse"></div>
                    <div className="w-24 h-12 bg-white/5 rounded-xl animate-pulse"></div>
                    <div className="w-32 h-12 bg-white/5 rounded-xl animate-pulse"></div>
                </div>

                {/* Filter Tabs Skeleton */}
                <div className="flex gap-2 mb-6">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="w-24 h-10 bg-white/5 rounded-lg animate-pulse"></div>
                    ))}
                </div>

                {/* Tasks List Skeleton */}
                <div className="space-y-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-24 bg-white/5 rounded-xl animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <ProTaskModal
                isOpen={showTaskModal}
                onClose={() => { setShowTaskModal(false); setEditingTask(null); }}
                onSuccess={handleTaskCreated}
                initialTask={editingTask}
            />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">
                    Tâches <span className="text-gradient-primary">Intelligentes</span>
                </h1>
                <p className="text-slate-400">Organisées et priorisées par NEURIVA</p>
            </div>

            {/* Stats Cards */}
            {/* ... (keep stats cards) ... */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                            <Circle className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.total}</p>
                            <p className="text-xs text-slate-400">À faire</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.completed}</p>
                            <p className="text-xs text-slate-400">Terminées</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-red-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.urgent}</p>
                            <p className="text-xs text-slate-400">Urgentes</p>
                        </div>
                    </div>
                </Card>
                <Card className="p-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-orange-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{stats.atRisk}</p>
                            <p className="text-xs text-slate-400">À risque</p>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Rechercher une tâche..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary-500 transition-colors"
                    />
                </div>
                <Button variant="secondary" className="gap-2">
                    <Filter className="w-4 h-4" />
                    Filtres
                </Button>
                <Button className="gap-2" onClick={() => { setEditingTask(null); setShowTaskModal(true); }}>
                    <Plus className="w-4 h-4" />
                    Nouvelle tâche
                </Button>
            </div>

            {/* Filter Tabs */}
            <TaskFilters activeFilter={activeFilter} onFilterChange={setActiveFilter} />

            {/* Tasks List */}
            <div className="space-y-4">
                {filteredTasks.length === 0 ? (
                    <Card className="p-12 text-center">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Aucune tâche trouvée</h3>
                        <p className="text-slate-400">
                            {searchQuery ? 'Essayez une autre recherche' : activeFilter === 'completed' ? "Vous n'avez pas encore terminé de tâches" : 'Tout est à jour ! 🎉'}
                        </p>
                        {!searchQuery && activeFilter !== 'completed' && (
                            <Button className="mt-4 gap-2" size="sm" onClick={() => setShowTaskModal(true)}>
                                <Plus className="w-4 h-4" />
                                Créer une tâche
                            </Button>
                        )}
                    </Card>
                ) : (
                    filteredTasks.map((task, index) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            index={index}
                            onToggle={() => handleToggleTask(task.id)}
                            onEdit={() => { setEditingTask(task); setShowTaskModal(true); }}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
