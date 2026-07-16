import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'success' | 'warning' | 'danger' | 'info';
    className?: string;
}

export const Badge = ({ children, variant = 'info', className }: BadgeProps) => {
    const variants = {
        success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]',
        danger: 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
        info: 'bg-primary-500/10 text-primary-400 border-primary-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]',
    };

    return (
        <span
            className={cn(
                'px-4 py-1.5 rounded-full text-xs font-bold border backdrop-blur-md transition-all duration-300',
                variants[variant],
                className
            )}
        >
            {children}
        </span>
    );
};
