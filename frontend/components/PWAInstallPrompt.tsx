'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Share, PlusSquare } from 'lucide-react';
import { Button } from './ui/Button';

export default function PWAInstallPrompt() {
    const [isInstallable, setIsInstallable] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showIOSPrompt, setShowIOSPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Check if already installed
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        if (isStandalone) return;

        if (localStorage.getItem('pwa_prompt_dismissed')) {
            setDismissed(true);
            return;
        }

        // Android / Chrome
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setIsInstallable(true);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // iOS detection
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
        if (isIOS && !isStandalone) {
            // Show iOS specific prompt after a delay
            const timer = setTimeout(() => {
                if (!localStorage.getItem('pwa_prompt_dismissed')) {
                    setShowIOSPrompt(true);
                }
            }, 3000);
            return () => clearTimeout(timer);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            setIsInstallable(false);
        }
        
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setDismissed(true);
        setIsInstallable(false);
        setShowIOSPrompt(false);
        localStorage.setItem('pwa_prompt_dismissed', 'true');
    };

    if (dismissed) return null;

    if (isInstallable) {
        return (
            <AnimatePresence>
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-96 bg-slate-900 border border-primary-500/30 rounded-2xl p-4 shadow-2xl z-50 flex items-center justify-between gap-4"
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-xl">N</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">Installer NEURIVA</h4>
                            <p className="text-xs text-slate-400">Pour une expérience optimale</p>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={handleInstallClick} className="px-3 py-1.5 text-xs">
                            <Download className="w-4 h-4 mr-1" />
                            Installer
                        </Button>
                        <button onClick={handleDismiss} className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    if (showIOSPrompt) {
        return (
            <AnimatePresence>
                <motion.div 
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    className="fixed bottom-24 left-4 right-4 bg-slate-900 border border-primary-500/30 rounded-2xl p-4 shadow-2xl z-50"
                >
                    <button onClick={handleDismiss} className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white rounded-full transition-colors">
                        <X className="w-4 h-4" />
                    </button>
                    
                    <div className="flex items-start gap-4 mb-3 mt-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shrink-0">
                            <span className="text-white font-bold text-xl">N</span>
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-sm">Installer sur iPhone/iPad</h4>
                            <p className="text-xs text-slate-400 mt-1">Accédez à NEURIVA comme une vraie application.</p>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-xl p-3 text-sm text-slate-300">
                        <p className="flex items-center gap-2 mb-2">
                            1. Touchez <Share className="w-4 h-4 text-blue-400" /> dans la barre de menu
                        </p>
                        <p className="flex items-center gap-2">
                            2. Choisissez <PlusSquare className="w-4 h-4" /> <strong>Sur l'écran d'accueil</strong>
                        </p>
                    </div>
                </motion.div>
            </AnimatePresence>
        );
    }

    return null;
}
