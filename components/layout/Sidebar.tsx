'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CheckSquare, MessageSquare, BarChart3, User, Zap } from 'lucide-react';

const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/tasks', label: 'Tâches', icon: CheckSquare },
    { href: '/chat', label: 'Chat IA', icon: MessageSquare },
    { href: '/focus', label: 'Focus', icon: Zap },
    { href: '/insights', label: 'Stats', icon: BarChart3 },
    { href: '/profile', label: 'Profil', icon: User },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="hidden md:flex flex-col w-64 bg-[#0A0A0A] border-r border-white/5 p-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 mb-12">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                    <span className="text-white font-bold text-sm">N</span>
                </div>
                <span className="text-xl font-bold font-display tracking-tight">NEURIVA</span>
            </Link>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive
                                    ? 'bg-primary-500/20 text-primary-300 border border-primary-500/30'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Bottom Section */}
            <div className="pt-6 border-t border-white/5">
                <div className="p-4 rounded-xl bg-gradient-to-br from-primary-900/20 to-secondary-900/20 border border-primary-500/20">
                    <p className="text-xs font-bold text-primary-400 uppercase tracking-wider mb-1">Version Gratuite</p>
                    <p className="text-sm text-slate-300 mb-3">Passez à Pro pour débloquer toutes les fonctionnalités</p>
                    <Link href="/premium">
                        <button className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white text-sm font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.5)] transition-all">
                            Upgrade
                        </button>
                    </Link>
                </div>
            </div>
        </aside>
    );
}
