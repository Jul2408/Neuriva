'use client';

import React from 'react';

interface TaskFiltersProps {
    activeFilter: 'all' | 'today' | 'urgent' | 'completed';
    onFilterChange: (filter: 'all' | 'today' | 'urgent' | 'completed') => void;
}

export default function TaskFilters({ activeFilter, onFilterChange }: TaskFiltersProps) {
    const filters = [
        { id: 'all' as const, label: 'Toutes', count: null },
        { id: 'today' as const, label: "Aujourd'hui", count: null },
        { id: 'urgent' as const, label: 'Urgentes', count: null },
        { id: 'completed' as const, label: 'Terminées', count: null }
    ];

    return (
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {filters.map(filter => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeFilter === filter.id
                            ? 'bg-primary-500 text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'
                            : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
                        }`}
                >
                    {filter.label}
                    {filter.count !== null && (
                        <span className="ml-2 px-2 py-0.5 rounded-full bg-white/20 text-xs">
                            {filter.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    );
}
