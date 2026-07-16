'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Brain, User, Sparkles, Loader2, Target, Zap, Activity, ChevronRight, Menu, Volume2, VolumeX, Bell, BellOff } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiService } from '@/lib/api/apiService';
import { playNotificationSound } from '@/lib/audio';
import { speakText } from '@/lib/speech';
import { requestNotificationPermission, sendSystemNotification } from '@/lib/notifications';
interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
    contextUsed?: string[];
}

interface AppContext {
    priority_task?: any;
    stats?: {
        streak?: number;
        focus_time?: number;
        completed_tasks?: number;
    };
    recent_tasks?: any[];
    mental_load?: {
        load_score: number;
    } | null;
}

const suggestions = [
    "Réorganise ma journée",
    "Quelle est ma prochaine tâche ?",
    "Analyse ma charge mentale",
    "Aide-moi à me concentrer"
];

// Helper to format message content (basic markdown support)
const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
        // Handle bold
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary-400 font-bold">$1</strong>');
        // Handle bullet points
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
                <div key={i} className="flex gap-2 mb-1">
                    <span className="text-primary-500 mt-1">•</span>
                    <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[•-]\s*/, '') }} />
                </div>
            );
        }
        return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
};

export default function ChatPage() {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Bonjour ! Je suis NEURIVA. Je suis connecté à votre tableau de bord et j'analyse vos tâches en temps réel. Comment puis-je optimiser votre performance aujourd'hui ?",
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [appContext, setAppContext] = useState<AppContext | null>(null);
    const [isLoadingContext, setIsLoadingContext] = useState(true);
    const [showContextSidebar, setShowContextSidebar] = useState(true);
    const [isMuted, setIsMuted] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [reminderTriggered, setReminderTriggered] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    useEffect(() => {
        const fetchContext = async () => {
            try {
                const data = await apiService.getDashboardData();
                setAppContext({
                    priority_task: data.priority_task,
                    stats: data.stats,
                    recent_tasks: data.recent_tasks,
                    mental_load: data.mental_load
                });
            } catch (error) {
                console.error('Error fetching context:', error);
            } finally {
                setIsLoadingContext(false);
            }
        };
        fetchContext();
        
        // Charger les préférences locales
        if (typeof window !== 'undefined') {
            const muted = localStorage.getItem('neuriva_muted') === 'true';
            setIsMuted(muted);
        }
    }, []);

    // Vérifier les rappels de tâches
    useEffect(() => {
        if (!appContext?.priority_task || reminderTriggered || isMuted) return;
        
        // Simulation: si on a une tâche prioritaire, on fait un rappel après 10 secondes de navigation
        const timer = setTimeout(() => {
            const msg = `Rappel : Votre tâche prioritaire "${appContext.priority_task.title}" vous attend.`;
            playNotificationSound();
            speakText(msg);
            if (notificationsEnabled) {
                sendSystemNotification("Rappel NEURIVA", { body: msg });
            }
            setReminderTriggered(true);
        }, 10000);
        
        return () => clearTimeout(timer);
    }, [appContext, reminderTriggered, isMuted, notificationsEnabled]);

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        localStorage.setItem('neuriva_muted', String(newMuted));
        if (newMuted && typeof window !== 'undefined') {
            window.speechSynthesis?.cancel(); // Arrêter la voix si on mute
        }
    };

    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            const granted = await requestNotificationPermission();
            setNotificationsEnabled(granted);
            if (granted) {
                sendSystemNotification("Notifications activées", { body: "NEURIVA pourra vous alerter même en arrière-plan." });
            }
        } else {
            setNotificationsEnabled(false);
        }
    };

    const handleSend = async (text?: string) => {
        const messageText = text || input;
        if (!messageText.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: messageText,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const conversationHistory = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            const response = await apiService.sendAIMessage(messageText, conversationHistory);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.message || response.fallback || "Désolé, je n'ai pas pu traiter votre demande.",
                timestamp: new Date(),
                contextUsed: ['tasks', 'mental_load', 'streak']
            };

            setMessages(prev => [...prev, aiMessage]);

            // Alerte sonore et vocale
            if (!isMuted) {
                playNotificationSound();
                setTimeout(() => {
                    speakText(aiMessage.content);
                }, 500); // Léger délai pour ne pas masquer le son de notification
            }

            // Notification système (si l'app est en arrière-plan)
            if (notificationsEnabled && document.hidden) {
                sendSystemNotification("NEURIVA a répondu", { body: aiMessage.content });
            }
        } catch (error) {
            console.error('Erreur IA:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: "Désolé, je rencontre des difficultés techniques pour accéder à mon noyau neural. Veuillez réessayer dans quelques instants. 🔧",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-[calc(100vh-64px)] md:h-screen bg-background overflow-hidden relative">
            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
                {/* Header */}
                <div className="p-4 md:p-6 border-b border-white/5 bg-background/50 backdrop-blur-md flex items-center justify-between sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-background flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                            </div>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">NEURIVA IA</h1>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-medium">Connecté au contexte</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={toggleNotifications}
                            className={`p-2 hover:bg-white/5 rounded-lg transition-colors text-white hidden md:block`}
                            title="Notifications Push"
                        >
                            {notificationsEnabled ? (
                                <Bell className="w-5 h-5 text-primary-400" />
                            ) : (
                                <BellOff className="w-5 h-5 text-slate-400" />
                            )}
                        </button>
                        <button
                            onClick={toggleMute}
                            className={`p-2 hover:bg-white/5 rounded-lg transition-colors text-white`}
                            title="Son et Voix de l'IA"
                        >
                            {!isMuted ? (
                                <Volume2 className="w-5 h-5 text-primary-400" />
                            ) : (
                                <VolumeX className="w-5 h-5 text-slate-400" />
                            )}
                        </button>
                        <button
                            onClick={() => setShowContextSidebar(!showContextSidebar)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-white"
                        >
                            <Activity className={`w-5 h-5 ${showContextSidebar ? 'text-primary-400' : 'text-slate-400'}`} />
                        </button>
                    </div>
                </div>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-8 custom-scrollbar">
                    <AnimatePresence initial={false}>
                        {messages.map((message, index) => (
                            <motion.div
                                key={message.id}
                                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.3 }}
                                className={`flex gap-3 md:gap-4 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-inner ${message.role === 'assistant'
                                        ? 'bg-gradient-to-br from-primary-600/20 to-secondary-600/20 border border-primary-500/30'
                                        : 'bg-white/5 border border-white/10'
                                    }`}>
                                    {message.role === 'assistant' ? (
                                        <Brain className="w-4 h-4 md:w-5 md:h-5 text-primary-400" />
                                    ) : (
                                        <User className="w-4 h-4 md:w-5 md:h-5 text-slate-400" />
                                    )}
                                </div>

                                {/* Message Bubble */}
                                <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`p-4 md:p-5 rounded-2xl relative group transition-all duration-300 ${message.role === 'assistant'
                                            ? 'bg-white/5 border border-white/10 hover:border-primary-500/20 shadow-xl shadow-black/20'
                                            : 'bg-primary-500/10 border border-primary-500/20 text-white shadow-lg shadow-primary-500/5'
                                        }`}>
                                        <div className="text-sm md:text-[15px] leading-relaxed">
                                            {formatContent(message.content)}
                                        </div>

                                        {message.contextUsed && (
                                            <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider text-slate-500">
                                                <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-yellow-500" /> Analyse cognitive effectuée</span>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] text-slate-500 mt-2 px-1">
                                        {message.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {/* Typing indicator */}
                    {isTyping && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex gap-4 items-center"
                        >
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 rounded-full bg-primary-500 animate-bounce"></div>
                                    <div className="w-1 h-1 rounded-full bg-primary-500 animate-bounce delay-75"></div>
                                    <div className="w-1 h-1 rounded-full bg-primary-500 animate-bounce delay-150"></div>
                                </div>
                            </div>
                            <span className="text-xs text-slate-500 italic font-medium">NEURIVA analyse vos données...</span>
                        </motion.div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions Bar */}
                {messages.length === 1 && (
                    <div className="px-6 pb-2">
                        <div className="flex flex-wrap gap-2">
                            {suggestions.map((suggestion, index) => (
                                <motion.button
                                    key={index}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 + index * 0.1 }}
                                    onClick={() => handleSend(suggestion)}
                                    className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary-500/10 hover:border-primary-500/40 transition-all text-xs md:text-sm flex items-center gap-2 group"
                                >
                                    <Sparkles className="w-3.5 h-3.5 text-primary-400 group-hover:scale-110 transition-transform" />
                                    {suggestion}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Input Area */}
                <div className="p-4 md:p-6 border-t border-white/5 bg-background/50 backdrop-blur-sm">
                    <div className="max-w-4xl mx-auto flex gap-3 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyPress}
                            placeholder="Interrogez votre cerveau exécutif..."
                            className="flex-1 px-5 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500/50 transition-all resize-none min-h-[56px] max-h-32 text-sm md:text-base pr-16"
                            rows={1}
                        />
                        <div className="absolute right-2 bottom-2 top-2 flex items-center px-2">
                            <Button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                size="sm"
                                className={`rounded-xl h-full aspect-square md:aspect-auto md:px-4 ${input.trim() ? 'bg-primary-500 shadow-lg shadow-primary-500/20 text-white' : 'bg-white/5 text-slate-500'
                                    }`}
                            >
                                {isTyping ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </Button>
                        </div>
                    </div>
                    <p className="text-center text-[10px] text-slate-600 mt-3 md:mt-4 uppercase tracking-[0.2em]">
                        NEURIVA AI v2.0 • Propulsé par Google Gemini Pro
                    </p>
                </div>
            </div>

            {/* Context Sidebar (Right) */}
            <AnimatePresence>
                {showContextSidebar && (
                    <motion.div
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 320 }}
                        exit={{ opacity: 0, width: 0 }}
                        className="hidden md:flex flex-col bg-white/[0.02] border-l border-white/5 overflow-hidden"
                    >
                        <div className="flex-1 flex flex-col min-w-[320px] overflow-y-auto custom-scrollbar">
                            <div className="p-6 border-b border-white/5">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-primary-500" />
                                    Analyse en direct
                                </h2>
                            </div>

                            <div className="p-6 space-y-8">
                                {/* Mental Load Card */}
                                <section>
                                    <div className="flex justify-between items-center mb-3">
                                        <h3 className="text-xs font-semibold text-white/70">Charge Mentale</h3>
                                        <Badge variant="outline" className="border-primary-500/30 text-primary-400">
                                            {appContext?.mental_load?.load_score || 0}/10
                                        </Badge>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(appContext?.mental_load?.load_score || 0) * 10}%` }}
                                            className="h-full bg-gradient-to-r from-primary-500 to-secondary-500"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 italic">
                                        {(appContext?.mental_load?.load_score || 0) > 7
                                            ? "Attention: Charge critique détectée."
                                            : "Niveau de stress optimal pour la performance."}
                                    </p>
                                </section>

                                {/* Priority Task */}
                                <section>
                                    <h3 className="text-xs font-semibold text-white/70 mb-3 flex items-center gap-2">
                                        <Target className="w-3.5 h-3.5 text-secondary-500" />
                                        Priorité du moment
                                    </h3>
                                    {isLoadingContext ? (
                                        <div className="h-24 rounded-xl bg-white/5 animate-pulse" />
                                    ) : appContext?.priority_task ? (
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 group cursor-pointer hover:border-primary-500/30 transition-all">
                                            <div className="flex items-start justify-between gap-2">
                                                <p className="text-sm font-medium line-clamp-2">{appContext.priority_task.title}</p>
                                                <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                            <div className="flex items-center gap-2 mt-3">
                                                <Badge className="bg-red-500/20 text-red-400 border-none text-[10px]">Urgent</Badge>
                                                <span className="text-[10px] text-slate-500">Exp: {new Date(appContext.priority_task.due_date).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-4 rounded-xl bg-white/5 border border-dashed border-white/10 text-center">
                                            <p className="text-xs text-slate-500">Aucune tâche prioritaire</p>
                                        </div>
                                    )}
                                </section>

                                {/* Stats Grid */}
                                <section className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Streak</p>
                                        <p className="text-xl font-bold flex items-center gap-2">
                                            {appContext?.stats?.streak || 0}
                                            <span className="text-orange-500 text-sm">🔥</span>
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                        <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Focus Today</p>
                                        <p className="text-xl font-bold">
                                            {appContext?.stats?.focus_time || 0}
                                            <span className="text-xs font-normal text-slate-500 ml-1">min</span>
                                        </p>
                                    </div>
                                </section>

                                {/* Recent Tasks */}
                                <section>
                                    <h3 className="text-xs font-semibold text-white/70 mb-3">Prochaines étapes</h3>
                                    <div className="space-y-2">
                                        {appContext?.recent_tasks?.slice(0, 3).map((task: any) => (
                                            <div key={task.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary-500 group-hover:scale-125 transition-transform" />
                                                <p className="text-xs text-slate-400 truncate flex-1">{task.title}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            {/* Footer Info */}
                            <div className="mt-auto p-6 bg-gradient-to-t from-background to-transparent">
                                <div className="p-4 rounded-xl bg-primary-500/10 border border-primary-500/20 shadow-lg shadow-primary-500/5">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Sparkles className="w-4 h-4 text-primary-400" />
                                        <p className="text-xs font-bold">Conseil IA</p>
                                    </div>
                                    <p className="text-[11px] leading-relaxed text-slate-400">
                                        {appContext?.mental_load?.load_score && appContext.mental_load.load_score > 6
                                            ? "Votre charge mentale est élevée. Je conseille une pause de 15 min avant d'attaquer la tâche prioritaire."
                                            : "C'est le moment idéal pour une session Focus. Vos indicateurs sont au vert."
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
