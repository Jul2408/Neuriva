'use client';

import Link from 'next/link';
import { WifiOff, RefreshCw } from 'lucide-react';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-white">
            <div className="text-center max-w-sm">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/20 flex items-center justify-center mx-auto mb-6">
                    <WifiOff className="w-10 h-10 text-slate-400" />
                </div>
                <h1 className="text-2xl font-bold font-display mb-3">Vous êtes hors ligne</h1>
                <p className="text-slate-400 text-sm mb-6">
                    NEURIVA a besoin d'une connexion pour accéder à vos données en temps réel. 
                    Vos tâches en cache restent disponibles.
                </p>
                <div className="flex flex-col gap-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-400 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Réessayer
                    </button>
                    <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 transition-colors"
                    >
                        Accueil en cache
                    </Link>
                </div>
            </div>
        </div>
    );
}
