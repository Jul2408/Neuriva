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
        glass: 'bg-white/[0.02] backdrop-blur-2xl border border-white/[0.08] shadow-[0_16px_40px_rgba(0,0,0,0.8)] relative overflow-hidden',
        solid: 'bg-[#0A0A0A] border border-white/[0.05]',
        outline: 'bg-transparent border border-white/10',
    };

    return (
        <div
            className={cn(
                'rounded-2xl md:rounded-[2rem] p-5 md:p-8 transition-all duration-500 relative',
                variants[variant],
                hoverEffect && 'hover:bg-white/[0.04] hover:border-primary-500/30 hover:shadow-[0_20px_50px_rgba(139,92,246,0.15)] hover:translate-y-[-4px]',
                className
            )}
            {...props}
        >
            {variant === 'glass' && (
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.15] mix-blend-overlay pointer-events-none z-0"></div>
            )}
            <div className="relative z-10 w-full h-full">
                {children}
            </div>
        </div>
    );
};
