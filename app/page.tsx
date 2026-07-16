'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import {
    Brain,
    Zap,
    ShieldCheck,
    Clock,
    TrendingUp,
    MessageSquare,
    ArrowRight,
    CheckCircle2,
    Sparkles,
    Activity,
    Lock,
    Cpu,
    Fingerprint,
    Play
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';

// Smooth scroll wrapper
const Section = ({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) => (
    <motion.div
        id={id}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={className}
    >
        {children}
    </motion.div>
);

export default function Home() {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    });

    return (
        <div className="min-h-screen bg-background text-white selection:bg-primary-500/30 overflow-x-hidden font-sans">
            <motion.div
                className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 origin-left z-[100]"
                style={{ scaleX }}
            />

            {/* Dynamic Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary-600/10 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-secondary-600/10 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-accent-600/5 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
                <div className="absolute inset-0 bg-grid opacity-[0.03]"></div>
            </div>

            {/* Navigation */}
            <header className="fixed top-6 left-0 right-0 z-50 px-6">
                <motion.nav
                    initial={{ y: -100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="max-w-5xl mx-auto glass rounded-full px-6 py-4 flex items-center justify-between"
                >
                    <div className="flex items-center gap-3">
                        <Logo />
                        <span className="text-xl font-bold font-display tracking-tight hover:text-primary-400 transition-colors cursor-pointer">NEURIVA</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        {[
                            { label: 'Solutions', href: '#solutions' },
                            { label: 'Méthode', href: '#methode' },
                            { label: 'Tarifs', href: '#tarifs' }
                        ].map((item) => (
                            <Link key={item.label} href={item.href} className="text-sm font-medium text-slate-400 hover:text-white transition-colors relative group">
                                {item.label}
                                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-500 transition-all group-hover:w-full"></span>
                            </Link>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="/auth/login" className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white transition-colors">
                            Connexion
                        </Link>
                        <Link href="/onboarding">
                            <Button size="sm" className="rounded-full px-6">Essayer</Button>
                        </Link>
                    </div>
                </motion.nav>
            </header>

            {/* Hero Section */}
            <section className="relative pt-48 pb-32 px-6 overflow-hidden min-h-screen flex flex-col justify-center">
                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-10 backdrop-blur-md shadow-[0_0_30px_rgba(139,92,246,0.2)]"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-xs font-bold text-primary-200 tracking-wider uppercase">Nouvelle Génération d'IA Personnelle</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-8xl font-display font-bold tracking-tight mb-8 leading-[1.1] text-transparent bg-clip-text bg-gradient-to-b from-white via-white to-slate-400">
                        Votre second cerveau <br />
                        <span className="text-gradient-primary">ne dort jamais.</span>
                    </h1>

                    <p className="text-lg md:text-2xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                        Libérez votre charge mentale. NEURIVA apprend, anticipe et organise votre vie pour que vous puissiez vous concentrer sur l'essentiel.
                    </p>

                    <motion.div
                        className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-24"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                    >
                        <Link href="/onboarding">
                            <Button size="lg" className="h-16 px-10 text-lg rounded-full shadow-[0_0_40px_rgba(139,92,246,0.3)] hover:shadow-[0_0_60px_rgba(139,92,246,0.5)]">
                                Commencer l'analyse
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                        <Link href="#demo">
                            <div className="flex items-center gap-3 px-8 py-4 rounded-full glass hover:bg-white/10 transition-all cursor-pointer group">
                                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Play className="w-4 h-4 fill-white text-white ml-1" />
                                </div>
                                <span className="font-medium">Voir la démo</span>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Hero Dashboard Preview */}
                    <motion.div
                        initial={{ opacity: 0, rotateX: 20, y: 100 }}
                        animate={{ opacity: 1, rotateX: 0, y: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="relative max-w-6xl mx-auto perspective-1000"
                    >
                        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20 h-full w-full pointer-events-none"></div>
                        <div className="glass-card rounded-2xl p-2 md:p-4 border-white/10 shadow-2xl transform-gpu">
                            <div className="bg-[#0A0A0A] rounded-xl overflow-hidden aspect-[16/9] relative border border-white/5">
                                {/* Dashboard Mockup Elements */}
                                <div className="absolute top-0 left-0 w-64 h-full border-r border-white/5 bg-[#0F0F16] p-4 hidden md:flex flex-col gap-4">
                                    <div className="h-8 w-8 rounded-full bg-primary-500/20 mb-8 self-center"></div>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className="h-10 w-full rounded-lg bg-white/5 flex items-center px-4 gap-3">
                                            <div className="w-4 h-4 rounded bg-white/10"></div>
                                            <div className="w-20 h-2 rounded bg-white/10"></div>
                                        </div>
                                    ))}
                                </div>
                                <div className="md:ml-64 p-8 grid grid-cols-3 gap-6">
                                    <div className="col-span-2 space-y-6">
                                        <div className="h-48 rounded-2xl bg-gradient-to-br from-primary-900/20 to-secondary-900/20 border border-white/5 p-6 relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-grid opacity-10"></div>
                                            <div className="flex justify-between items-start mb-8">
                                                <div>
                                                    <div className="text-secondary-400 text-sm font-bold mb-1">SCORE DE FOCUS</div>
                                                    <div className="text-4xl font-display font-bold text-white">92<span className="text-lg text-slate-500">/100</span></div>
                                                </div>
                                                <Activity className="text-primary-400" />
                                            </div>
                                            <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-gradient-to-r from-primary-500 to-secondary-400"
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: '92%' }}
                                                    transition={{ duration: 1.5, delay: 0.5 }}
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="h-40 rounded-2xl bg-white/5 border border-white/5 p-4">
                                                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center mb-4">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <div className="text-2xl font-bold">12</div>
                                                <div className="text-slate-500 text-sm">Tâches complétées</div>
                                            </div>
                                            <div className="h-40 rounded-2xl bg-white/5 border border-white/5 p-4">
                                                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center mb-4">
                                                    <Zap className="w-4 h-4 text-orange-400" />
                                                </div>
                                                <div className="text-2xl font-bold">4.5h</div>
                                                <div className="text-slate-500 text-sm">Deep Work</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:block">
                                        <div className="h-full rounded-2xl bg-white/5 border border-white/5 p-6">
                                            <div className="text-sm text-slate-400 mb-6">PROCHAINES ACTIONS</div>
                                            {[1, 2, 3].map(i => (
                                                <div key={i} className="mb-4 p-4 rounded-xl bg-white/5 border border-white/5 flex gap-3 text-sm">
                                                    <div className="w-4 h-4 rounded-full border border-primary-500/50 mt-0.5"></div>
                                                    <div className="bg-white/10 h-2 w-32 rounded self-center"></div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Use Cases Section */}
            <Section className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <p className="text-center text-primary-400 font-bold mb-4 uppercase tracking-wider">Pour qui ?</p>
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-16">Adapté à <span className="text-white">votre cerveau</span></h2>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="p-8 hover:bg-white/5 transition-colors">
                            <div className="text-4xl mb-6">🎓</div>
                            <h3 className="text-xl font-bold mb-3">L'Étudiant</h3>
                            <p className="text-slate-400 text-sm">Gérez vos partiels et projets sans nuits blanches. NEURIVA décompose vos révisions en blocs digestes.</p>
                        </Card>
                        <Card className="p-8 hover:bg-white/5 transition-colors">
                            <div className="text-4xl mb-6">💻</div>
                            <h3 className="text-xl font-bold mb-3">Le Freelance</h3>
                            <p className="text-slate-400 text-sm">Jonglez entre plusieurs clients sans rien oublier. Le tracking automatique de temps vous sauve la mise.</p>
                        </Card>
                        <Card className="p-8 hover:bg-white/5 transition-colors">
                            <div className="text-4xl mb-6">🧠</div>
                            <h3 className="text-xl font-bold mb-3">Le Cerveau Atypique</h3>
                            <p className="text-slate-400 text-sm">TDAH ? Procrastination ? L'interface ultra-claire et le mode Focus empêchent la dispersion.</p>
                        </Card>
                    </div>
                </div>
            </Section>

            {/* Science Section */}
            <Section id="science" className="py-20 px-6 border-y border-white/5 bg-white/[0.01]">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8">
                        <span className="px-3 py-1 rounded-full bg-secondary-500/20 text-secondary-300 text-sm font-medium border border-secondary-500/30">Méthodologie Scientifique</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold">Hackez votre dopamine.</h2>
                        <p className="text-slate-400 text-lg leading-relaxed">
                            NEURIVA n'est pas magique, c'est de la science. Nous utilisons la technique des <strong className="text-white">"micro-récompenses"</strong> et les cycles ultradiens pour maintenir votre cerveau en état de Flow.
                        </p>
                        <ul className="space-y-4">
                            {[
                                "Cycles de 90 minutes optimisés",
                                "Réduction de la charge cognitive (Loi de Miller)",
                                "Gamification positive sans addiction"
                            ].map((item, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-300">
                                    <div className="w-6 h-6 rounded-full bg-secondary-500/20 flex items-center justify-center">
                                        <CheckCircle2 className="w-3 h-3 text-secondary-400" />
                                    </div>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 relative">
                        <div className="absolute inset-0 bg-secondary-500/30 blur-[100px] -z-10"></div>
                        <div className="glass p-8 rounded-3xl border border-white/10 relative">
                            {/* Abstract Visual Representation of Flow */}
                            <div className="h-64 flex items-end justify-center gap-2">
                                {[40, 60, 45, 80, 55, 90, 70, 85, 60, 50].map((h, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ height: 20 }}
                                        whileInView={{ height: `${h}%` }}
                                        transition={{ duration: 1, delay: i * 0.1 }}
                                        className="w-4 bg-gradient-to-t from-secondary-600 to-primary-400 rounded-t-full opacity-80"
                                    />
                                ))}
                            </div>
                            <div className="mt-4 text-center text-sm font-mono text-secondary-300">Analyse de Flow en temps réel</div>
                        </div>
                    </div>
                </div>
            </Section>

            {/* Problem / Solution Section */}
            <Section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl md:text-5xl font-display font-bold mb-6">Le chaos vs. <span className="text-gradient-primary">L'Ordre</span></h2>
                        <p className="text-slate-400 max-w-2xl mx-auto">La plupart des outils vous demandent de travailler pour eux. NEURIVA travaille pour vous.</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <Card className="p-10 border-red-500/20 bg-red-950/5" variant="outline" hoverEffect={false}>
                            <h3 className="text-xl font-bold text-red-400 mb-6 flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-red-500/10">❌</span>
                                Sans NEURIVA
                            </h3>
                            <ul className="space-y-4 text-slate-400">
                                <li className="flex gap-3"><span className="text-red-500/50">•</span> To-do lists interminables et stressantes</li>
                                <li className="flex gap-3"><span className="text-red-500/50">•</span> Procrastination due à la surcharge</li>
                                <li className="flex gap-3"><span className="text-red-500/50">•</span> Perte de temps à organiser au lieu de faire</li>
                                <li className="flex gap-3"><span className="text-red-500/50">•</span> Oublis importants et charge mentale élevée</li>
                            </ul>
                        </Card>

                        <Card className="p-10 border-emerald-500/20 bg-emerald-950/5 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[50px] rounded-full"></div>
                            <h3 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
                                <span className="p-2 rounded-lg bg-emerald-500/10">✨</span>
                                Avec NEURIVA
                            </h3>
                            <ul className="space-y-4 text-slate-300">
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Planification automatique intelligente</li>
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Focus sur une seule tâche à la fois</li>
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Adaptation en temps réel aux imprévus</li>
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-5 h-5 text-emerald-500" /> Sérénité et accomplissement quotidien</li>
                            </ul>
                        </Card>
                    </div>
                </div>
            </Section>

            {/* Features (Bento Grid Style) - Solutions */}
            <Section id="solutions" className="py-32 px-6 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <div className="mb-20">
                        <span className="text-primary-400 font-bold tracking-wider text-sm uppercase">Fonctionnalités</span>
                        <h2 className="text-4xl md:text-5xl font-display font-bold mt-4 mb-6">Tout ce dont votre cerveau a besoin.</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-8 h-auto md:h-[800px]">
                        <Card className="md:col-span-2 md:row-span-1 p-10 relative overflow-hidden group">
                            <div className="absolute right-0 top-0 w-1/2 h-full bg-gradient-to-l from-primary-900/20 to-transparent"></div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <Brain className="w-8 h-8 text-primary-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Cerveau Local & Privé</h3>
                                <p className="text-slate-400 max-w-md">Vos données sont sacrées. NEURIVA utilise une IA locale qui tourne directement sur votre appareil. Zéro fuite de données, 100% de confidentialité.</p>
                            </div>
                        </Card>

                        <Card className="md:col-span-1 md:row-span-1 p-10 flex flex-col justify-between group">
                            <div>
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <Zap className="w-8 h-8 text-yellow-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-2">Anticipation</h3>
                                <p className="text-slate-400 text-sm">Détecte les retards avant qu'ils n'arrivent.</p>
                            </div>
                            <div className="w-full bg-white/5 h-1 mt-4 rounded-full overflow-hidden">
                                <div className="h-full bg-yellow-400 w-2/3 animate-pulse"></div>
                            </div>
                        </Card>

                        <Card className="md:col-span-1 md:row-span-1 p-10 group">
                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                <MessageSquare className="w-8 h-8 text-secondary-400" />
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Chat IA Contextuel</h3>
                            <p className="text-slate-400">"Hey NEURIVA, réorganise ma journée, j'ai eu une urgence." — et c'est fait.</p>
                        </Card>

                        <Card className="md:col-span-2 md:row-span-1 p-10 flex items-center justify-between relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent z-10"></div>
                            <div className="absolute inset-0 bg-[url('/noise.png')] opacity-20 mix-blend-overlay"></div>

                            <div className="relative z-20 max-w-lg">
                                <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                                    <TrendingUp className="w-8 h-8 text-emerald-400" />
                                </div>
                                <h3 className="text-2xl font-bold mb-4">Analyses Cognitives</h3>
                                <p className="text-slate-400">Comprenez vos cycles d'énergie. NEURIVA identifie vos pics de productivité pour planifier les tâches difficiles au meilleur moment.</p>
                            </div>

                            {/* Visual candy */}
                            <div className="absolute right-[-50px] top-10 md:top-20 z-0 opacity-50 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-2 items-end">
                                    <div className="w-4 h-12 bg-primary-500/20 rounded-t"></div>
                                    <div className="w-4 h-24 bg-primary-500/40 rounded-t"></div>
                                    <div className="w-4 h-32 bg-primary-500/60 rounded-t"></div>
                                    <div className="w-4 h-20 bg-primary-500/30 rounded-t"></div>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </Section>

            {/* How it works - Methode */}
            <Section id="methode" className="py-32 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Comment ça marche ?</h2>
                    </div>

                    <div className="relative">
                        <div className="absolute left-[20px] md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-primary-500/50 to-transparent"></div>

                        {[
                            { step: "01", title: "Lâchez prise", desc: "Déversez toutes vos tâches, idées et RDV en vrac dans NEURIVA. L'IA trie tout pour vous." },
                            { step: "02", title: "L'IA Analyse", desc: "NEURIVA évalue la durée, la complexité et votre niveau d'énergie actuel pour créer le planning parfait." },
                            { step: "03", title: "Mode Focus", desc: "Lancez votre session. Une seule tâche s'affiche. Pas de distractions. Juste de l'avancement." }
                        ].map((item, i) => (
                            <div key={i} className={`relative flex flex-col md:flex-row gap-8 mb-20 ${i % 2 === 0 ? 'md:text-right' : 'md:flex-row-reverse md:text-left'}`}>
                                <div className="hidden md:block flex-1"></div>
                                <div className="absolute left-0 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-slate-900 border-4 border-primary-900 flex items-center justify-center z-10 shadow-[0_0_20px_rgba(139,92,246,0.5)]">
                                    <div className="w-3 h-3 bg-white rounded-full"></div>
                                </div>
                                <div className="flex-1 pl-12 md:pl-0">
                                    <div className="text-6xl font-display font-bold text-white/5 mb-2 leading-none absolute -top-8 -z-10 select-none">{item.step}</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">{item.title}</h3>
                                    <p className="text-slate-400">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Testimonials */}
            <Section className="py-20 px-6 bg-white/[0.02]">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl md:text-5xl font-display font-bold text-center mb-16">Ils ont repris le <span className="text-gradient-primary">contrôle</span></h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { user: "Thomas L.", role: "Développeur Senior", quote: "Je pensais avoir un problème de discipline, j'avais juste un problème d'organisation. NEURIVA a changé la donne." },
                            { user: "Sarah M.", role: "Entrepreneuse", quote: "L'anticipation des retards est bluffante. Je ne cours plus après ma journée, je la dirige." },
                            { user: "Kevin B.", role: "Étudiant en Médecine", quote: "La charge mentale a disparu. Je sais exactement quoi faire et quand le faire. Merci !" }
                        ].map((t, i) => (
                            <Card key={i} className="p-8">
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map(star => <span key={star} className="text-yellow-400">★</span>)}
                                </div>
                                <p className="text-slate-300 mb-6 italic">"{t.quote}"</p>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-600"></div>
                                    <div>
                                        <div className="font-bold">{t.user}</div>
                                        <div className="text-xs text-slate-500">{t.role}</div>
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </div>
            </Section>

            {/* Pricing Section */}
            <Section id="tarifs" className="py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-24">
                        <span className="text-primary-400 font-bold tracking-wider text-sm uppercase">Tarifs simples</span>
                        <h2 className="text-3xl md:text-5xl font-display font-bold mt-4 mb-6">Investissez en <span className="text-white">vous-même</span></h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 items-center">
                        <Card className="p-8 border-white/5 bg-white/[0.02]" variant="outline" hoverEffect={false}>
                            <h3 className="text-2xl font-bold mb-2">Gratuit</h3>
                            <p className="text-slate-400 mb-8">Pour découvrir la puissance de l'IA.</p>
                            <div className="text-4xl font-display font-bold mb-8">0€ <span className="text-sm font-sans font-normal text-slate-500">/mois</span></div>
                            <ul className="space-y-4 mb-8 text-slate-300">
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-slate-500" /> Organisation basique</li>
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-slate-500" /> Mode Focus (3/jour)</li>
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-slate-500" /> Historique 7 jours</li>
                            </ul>
                            <Link href="/onboarding">
                                <Button variant="secondary" className="w-full">Démarrer gratuitement</Button>
                            </Link>
                        </Card>
                        <Card className="p-8 border-primary-500 relative transform scale-105 shadow-[0_0_40px_rgba(139,92,246,0.15)]">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Populaire</div>
                            <h3 className="text-2xl font-bold mb-2">Pro</h3>
                            <p className="text-slate-400 mb-8">Pour ceux qui veulent exceller.</p>
                            <div className="text-4xl font-display font-bold mb-8 text-gradient-primary">12€ <span className="text-sm font-sans font-normal text-slate-500 text-white">/mois</span></div>
                            <ul className="space-y-4 mb-8 text-white">
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-primary-400" /> IA Illimitée & Personnalisée</li>
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-primary-400" /> Mode Focus Illimité</li>
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-primary-400" /> Analyses Cognitives Avancées</li>
                                <li className="flex gap-3 items-center"><CheckCircle2 className="w-4 h-4 text-primary-400" /> Support Prioritaire</li>
                            </ul>
                            <Link href="/onboarding">
                                <Button size="lg" className="w-full">Essayer Pro Gratuitement</Button>
                            </Link>
                        </Card>
                    </div>
                </div>
            </Section>

            {/* FAQ */}
            <Section className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-center mb-12">Questions fréquentes</h2>
                    <div className="space-y-4">
                        {[
                            { q: "Mes données sont-elles vraiment privées ?", a: "Oui. NEURIVA utilise une IA locale (via WebLLM) qui tourne dans votre navigateur. Vos tâches ne quittent jamais votre appareil." },
                            { q: "Est-ce compatible avec Google Calendar ?", a: "Bientôt ! L'intégration bidirectionnelle est prévue pour la version 2.0." },
                            { q: "Puis-je l'utiliser hors ligne ?", a: "Absolument. Une fois chargée, l'application fonctionne parfaitement sans internet." }
                        ].map((faq, i) => (
                            <Card key={i} className="p-6 hover:bg-white/5 transition-colors cursor-pointer" hoverEffect={false}>
                                <h3 className="font-bold text-lg mb-2">{faq.q}</h3>
                                <p className="text-slate-400">{faq.a}</p>
                            </Card>
                        ))}
                    </div>
                </div>
            </Section>

            {/* CTA Section */}
            <Section className="py-32 px-6">
                <div className="max-w-5xl mx-auto">
                    <Card className="relative overflow-hidden p-12 md:p-24 text-center border-primary-500/30 bg-gradient-to-b from-primary-900/20 to-background group">
                        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-30"></div>
                        <div className="absolute top-[-50%] left-[-20%] w-[500px] h-[500px] bg-primary-500/20 rounded-full blur-[100px] group-hover:bg-primary-500/30 transition-all duration-1000"></div>

                        <div className="relative z-10">
                            <h2 className="text-4xl md:text-7xl font-display font-bold mb-8">Reprenez le contrôle <br /> de votre temps.</h2>
                            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                                Ne laissez plus le stress dicter votre quotidien. Commencez dès maintenant avec l'IA la plus avancée en gestion de productivité.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                                <Link href="/onboarding">
                                    <Button size="lg" className="h-16 px-12 text-xl rounded-full w-full sm:w-auto shadow-[0_0_50px_rgba(139,92,246,0.3)]">
                                        Créer mon compte gratuit
                                    </Button>
                                </Link>
                                <div className="flex items-center gap-2 text-slate-400 text-sm">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                    <span>Sans engagement</span>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </Section>

            {/* Footer */}
            <footer className="py-20 px-6 border-t border-white/5 relative z-10 bg-background">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="col-span-1 md:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <Logo />
                            <span className="text-2xl font-bold font-display tracking-tight">NEURIVA</span>
                        </div>
                        <p className="text-slate-500 max-w-sm leading-relaxed text-sm">
                            L'assistant personnel de nouvelle génération conçu pour les cerveaux ambitieux.
                        </p>
                        <div className="flex gap-4">
                            {['twitter', 'github', 'discord'].map(social => (
                                <div key={social} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 hover:text-white transition-colors cursor-pointer text-slate-400">
                                    {/* Icons would go here */}
                                    <span className="capitalize text-xs">{social[0]}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6">Produit</h4>
                        <ul className="space-y-4 text-slate-500 text-sm">
                            <li><Link href="#solutions" className="hover:text-primary-400 transition-colors">Fonctionnalités</Link></li>
                            <li><Link href="#science" className="hover:text-primary-400 transition-colors">Manifeste</Link></li>
                            <li><Link href="#tarifs" className="hover:text-primary-400 transition-colors">Tarifs</Link></li>
                            {/* Keep Roadmap as # for now or add section if needed */}
                            <li><Link href="#" className="hover:text-primary-400 transition-colors">Roadmap</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-6">Support</h4>
                        <ul className="space-y-4 text-slate-500 text-sm">
                            <li><Link href="#" className="hover:text-primary-400 transition-colors">Aide</Link></li>
                            <li><Link href="#" className="hover:text-primary-400 transition-colors">Community</Link></li>
                            <li><Link href="#" className="hover:text-primary-400 transition-colors">Légal</Link></li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-slate-600 text-xs">
                    <p>© 2025 NEURIVA Labs Inc. Tous droits réservés.</p>
                    <div className="flex gap-6 mt-4 md:mt-0">
                        <Link href="#" className="hover:text-slate-400">Confidentialité</Link>
                        <Link href="#" className="hover:text-slate-400">Conditions</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

