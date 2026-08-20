'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, BarChart3, User, Timer } from 'lucide-react';
import LivingBrain from '../ui/LivingBrain';

export default function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/dashboard', label: 'Accueil', icon: Home },
        { href: '/tasks', label: 'Tâches', icon: CheckSquare },
        { href: '/chat', label: 'IA', icon: null, isCenter: true },
        { href: '/focus', label: 'Focus', icon: Timer },
        { href: '/profile', label: 'Profil', icon: User },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 w-full z-50">
            <div className="bg-background/95 backdrop-blur-xl border-t border-white/10 px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
                <div className="flex items-end justify-around w-full max-w-lg mx-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                        const Icon = item.icon;

                        /* ── Bouton IA Central (Living Brain) ── */
                        if (item.isCenter) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative flex flex-col items-center justify-end group"
                                    style={{ marginBottom: 0 }}
                                >
                                    {/* Bulle surélevée du cerveau */}
                                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[64px] h-[64px] flex items-center justify-center transition-transform duration-300 group-hover:scale-105 group-active:scale-95">
                                        <LivingBrain isActive={isActive} />
                                    </div>
                                    {/* Espace réservé pour aligner le label */}
                                    <div className="w-[64px] h-[34px]" />
                                    <span className={`text-[10px] font-semibold transition-colors ${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-primary-300'}`}>
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
                                {Icon && (
                                    <Icon
                                        className={`w-[22px] h-[22px] transition-colors duration-200 ${isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'}`}
                                        strokeWidth={isActive ? 2.5 : 1.8}
                                    />
                                )}
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
