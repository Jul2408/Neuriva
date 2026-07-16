import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    hoverEffect?: boolean;
    variant?: 'glass' | 'solid' | 'outline';
}

export const Card = ({
    children,
    className,
    hoverEffect = true,
    variant = 'glass',
    ...props
}: CardProps) => {
    const variants = {
        glass: 'bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl',
        solid: 'bg-slate-900 border border-slate-800',
        outline: 'bg-transparent border border-white/10',
    };

    return (
        <div
            className={cn(
                'rounded-[2rem] p-8 transition-all duration-500',
                variants[variant],
                hoverEffect && 'hover:bg-white/[0.06] hover:border-primary-500/30 hover:translate-y-[-4px]',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
