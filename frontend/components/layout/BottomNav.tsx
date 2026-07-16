'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, BarChart3, User, Sparkles } from 'lucide-react';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Accueil', icon: Home },
        { href: '/tasks', label: 'Tâches', icon: CheckSquare },
        { href: '/chat', label: 'IA', icon: Sparkles, isCenter: true },
        { href: '/insights', label: 'Stats', icon: BarChart3 },
        { href: '/profile', label: 'Profil', icon: User },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50">
            {/* Fond de la barre : plein, collé au bas, pleine largeur */}
            <div className="bg-[#0c0c14]/95 backdrop-blur-xl border-t border-white/10 px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
                <div className="flex items-end justify-around w-full max-w-lg mx-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        /* ── Bouton IA Central ── */
                        if (item.isCenter) {
                            return (
                                <Link key={item.href} href={item.href} className="relative -mt-7 flex flex-col items-center group">
                                    {/* Glow pulsé */}
                                    <div className="absolute inset-0 -top-1 w-[60px] h-[60px] mx-auto rounded-full bg-gradient-to-tr from-primary-500 to-accent-500 blur-xl opacity-60 group-hover:opacity-90 transition-opacity duration-300 animate-pulse-slow" />

                                    {/* Cercle principal */}
                                    <div className={`
                                        relative flex items-center justify-center w-[56px] h-[56px] rounded-full
                                        bg-gradient-to-tr from-primary-600 via-primary-500 to-accent-500
                                        shadow-[0_4px_24px_rgba(139,92,246,0.5)]
                                        border-[3px] border-[#0c0c14]
                                        transition-transform duration-200
                                        group-hover:scale-105
                                        ${isActive ? 'scale-105 shadow-[0_4px_28px_rgba(139,92,246,0.7)]' : ''}
                                    `}>
                                        <Sparkles className="w-6 h-6 text-white" strokeWidth={2.5} />
                                    </div>

                                    {/* Label */}
                                    <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-primary-400' : 'text-slate-400'}`}>
                                        {item.label}
                                    </span>
                                </Link>
                            );
                        }

                        /* ── Boutons normaux ── */
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex flex-col items-center justify-center py-2 px-3 group relative"
                            >
                                <Icon
                                    className={`w-[22px] h-[22px] transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                                <span className={`text-[10px] font-medium mt-1 transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}>
                                    {item.label}
                                </span>

                                {/* Indicateur actif */}
                                {isActive && (
                                    <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary-400 shadow-[0_0_6px_2px_rgba(139,92,246,0.6)]" />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
