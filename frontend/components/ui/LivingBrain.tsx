'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Brain } from 'lucide-react';

interface LivingBrainProps {
    isActive?: boolean;
}

export default function LivingBrain({ isActive = false }: LivingBrainProps) {
    return (
        <div className="relative flex items-center justify-center w-full h-full">
            {/* Pulsation de fond (Synapses actives) */}
            <motion.div
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary-500/40 via-secondary-500/40 to-accent-500/40 blur-xl"
                animate={{
                    scale: [1, 1.4, 1],
                    opacity: [0.5, 0.8, 0.5],
                    rotate: [0, 90, 180, 270, 360],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "linear"
                }}
            />

            {/* Aura secondaire plus rapide */}
            <motion.div
                className="absolute inset-2 rounded-full bg-primary-400/30 blur-md"
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            />

            {/* Conteneur principal du cerveau */}
            <div className={`
                relative flex items-center justify-center w-full h-full rounded-full z-10
                bg-gradient-to-tr from-slate-900 to-background
                border-2 border-primary-500/30
                shadow-[0_0_15px_rgba(139,92,246,0.5)]
                ${isActive ? 'shadow-[0_0_25px_rgba(139,92,246,0.8)] border-primary-400/60' : ''}
                transition-all duration-300
            `}>
                {/* Icône du cerveau avec animation de flottaison */}
                <motion.div
                    animate={{
                        y: [-1, 1, -1],
                        rotate: [-1, 1, -1]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                >
                    <Brain 
                        className={`w-6 h-6 sm:w-7 sm:h-7 ${isActive ? 'text-primary-300' : 'text-primary-400'} drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]`} 
                        strokeWidth={2}
                    />
                </motion.div>
                
                {/* Petit point de traitement (style IA qui réfléchit) */}
                <motion.div
                    className="absolute top-2 right-2 w-1.5 h-1.5 bg-accent-400 rounded-full shadow-[0_0_5px_rgba(236,72,153,1)]"
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                />
            </div>
        </div>
    );
}
