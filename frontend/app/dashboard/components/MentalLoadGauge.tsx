'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';

interface MentalLoadGaugeProps {
    loadScore?: number; // 0-10
}

export default function MentalLoadGauge({ loadScore = 4.2 }: MentalLoadGaugeProps) {
    // Calculate percentage (0-100)
    const percentage = (loadScore / 10) * 100;

    // Determine color and status based on load
    const getLoadStatus = (score: number) => {
        if (score < 3) return { label: 'Serein', color: 'from-emerald-500 to-green-400', textColor: 'text-emerald-400' };
        if (score < 6) return { label: 'Équilibré', color: 'from-blue-500 to-cyan-400', textColor: 'text-blue-400' };
        if (score < 8) return { label: 'Chargé', color: 'from-yellow-500 to-orange-400', textColor: 'text-yellow-400' };
        return { label: 'Surchargé', color: 'from-red-500 to-rose-400', textColor: 'text-red-400' };
    };

    const status = getLoadStatus(loadScore);

    return (
        <Card className="p-6">
            <div className="mb-6">
                <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider mb-1">Charge Mentale</h3>
                <div className="flex items-baseline gap-2">
                    <span className={`text-4xl font-display font-bold ${status.textColor}`}>
                        {loadScore.toFixed(1)}
                    </span>
                    <span className="text-slate-500 text-sm">/10</span>
                </div>
                <p className={`text-sm font-medium mt-1 ${status.textColor}`}>{status.label}</p>
            </div>

            {/* Circular Gauge */}
            <div className="relative w-full aspect-square max-w-[200px] mx-auto mb-6">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="8"
                    />
                    {/* Progress circle */}
                    <motion.circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 40}`}
                        initial={{ strokeDashoffset: 2 * Math.PI * 40 }}
                        animate={{ strokeDashoffset: 2 * Math.PI * 40 * (1 - percentage / 100) }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`stroke-current bg-gradient-to-r ${status.color}`}
                        style={{
                            filter: 'drop-shadow(0 0 8px currentColor)'
                        }}
                    />
                </svg>

                {/* Center percentage */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-display font-bold text-white">
                        {Math.round(percentage)}%
                    </span>
                </div>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Tâches actives</span>
                    <span className="font-bold text-white">12</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">Urgentes</span>
                    <span className="font-bold text-orange-400">3</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-slate-400">En retard</span>
                    <span className="font-bold text-red-400">1</span>
                </div>
            </div>

            {/* AI Suggestion */}
            <div className="mt-4 pt-4 border-t border-white/5">
                <p className="text-xs text-slate-500">
                    💡 <span className="text-slate-400">Conseil: Terminez 2 tâches rapides pour réduire la pression.</span>
                </p>
            </div>
        </Card>
    );
}
