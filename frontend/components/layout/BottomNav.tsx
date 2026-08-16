'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, BarChart3, User, Sparkles } from 'lucide-react';
import LivingBrain from '../ui/LivingBrain';

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
            <div className="bg-background/95 backdrop-blur-xl border-t border-white/10 px-2 pt-2 pb-[env(safe-area-inset-bottom,8px)]">
                <div className="flex items-end justify-around w-full max-w-lg mx-auto">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        /* ── Bouton IA Central (Living Brain) ── */
                        if (item.isCenter) {
                            return (
                                <Link key={item.href} href={item.href} className="relative -mt-8 flex flex-col items-center group">
                                    {/* Conteneur principal du composant LivingBrain */}
                                    <div className="w-[64px] h-[64px] transition-transform duration-300 group-hover:scale-105">
                                        <LivingBrain isActive={isActive} />
                                    </div>
                                    
                                    {/* Label sous le cerveau */}
                                    <span className={`text-[10px] font-semibold mt-2 transition-colors ${isActive ? 'text-primary-400' : 'text-slate-400 group-hover:text-primary-300'}`}>
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
