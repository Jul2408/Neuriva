'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Send, Brain, User, Sparkles, Loader2, Target, Zap, Activity,
    Plus, Trash2, MessageSquare, ChevronLeft, Edit2, Check, X,
    Volume2, VolumeX, Bell, BellOff
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { apiService, ChatConversation, ChatMessage } from '@/lib/api/apiService';
import { playNotificationSound } from '@/lib/audio';
import { speakText } from '@/lib/speech';
import { requestNotificationPermission, sendSystemNotification } from '@/lib/notifications';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatContent = (content: string) => {
    return content.split('\n').map((line, i) => {
        const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-primary-400 font-bold">$1</strong>');
        if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
            return (
                <div key={i} className="flex gap-2 mb-1">
                    <span className="text-primary-500 mt-1 shrink-0">•</span>
                    <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[•-]\s*/, '') }} />
                </div>
            );
        }
        return <p key={i} className="mb-1 last:mb-0" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
};

const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "À l'instant";
    if (mins < 60) return `Il y a ${mins}min`;
    if (hours < 24) return `Il y a ${hours}h`;
    if (days === 1) return 'Hier';
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
};

const suggestions = [
    "Réorganise ma journée",
    "Quelle est ma prochaine tâche ?",
    "Analyse ma charge mentale",
    "Aide-moi à me concentrer",
];

// ─── Composant ────────────────────────────────────────────────────────────────

export default function ChatPage() {
    // Conversations
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoadingConversations, setIsLoadingConversations] = useState(true);
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);

    // Renaming
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingTitle, setEditingTitle] = useState('');

    // Chat state
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    // Sidebar panel (mobile: conversations | context)
    const [mobilePanel, setMobilePanel] = useState<'chat' | 'history'>('chat');

    // Settings
    const [isMuted, setIsMuted] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // ─── Init ────────────────────────────────────────────────────────────────

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setIsMuted(localStorage.getItem('neuriva_muted') === 'true');
        }
        loadConversations();
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    // ─── Conversations ───────────────────────────────────────────────────────

    const loadConversations = async () => {
        setIsLoadingConversations(true);
        try {
            const list = await apiService.getConversations();
            setConversations(list);
            // Auto-select the most recent conversation
            if (list.length > 0 && !activeConversationId) {
                await selectConversation(list[0].id);
            }
        } catch (err) {
            console.error('Failed to load conversations', err);
        } finally {
            setIsLoadingConversations(false);
        }
    };

    const selectConversation = async (id: string) => {
        if (id === activeConversationId) return;
        setActiveConversationId(id);
        setIsLoadingMessages(true);
        setMessages([]);
        setMobilePanel('chat');
        try {
            const conv = await apiService.getConversation(id);
            setMessages(conv.messages || []);
        } catch (err) {
            console.error('Failed to load messages', err);
        } finally {
            setIsLoadingMessages(false);
        }
    };

    const createNewConversation = async () => {
        const conv = await apiService.createConversation('Nouvelle conversation');
        setConversations(prev => [conv, ...prev]);
        setActiveConversationId(conv.id);
        setMessages([]);
        setMobilePanel('chat');
        setTimeout(() => inputRef.current?.focus(), 100);
    };

    const deleteConversation = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Supprimer cette conversation ?')) return;
        await apiService.deleteConversation(id);
        setConversations(prev => prev.filter(c => c.id !== id));
        if (activeConversationId === id) {
            const remaining = conversations.filter(c => c.id !== id);
            if (remaining.length > 0) {
                await selectConversation(remaining[0].id);
            } else {
                setActiveConversationId(null);
                setMessages([]);
            }
        }
    };

    const startRename = (e: React.MouseEvent, conv: ChatConversation) => {
        e.stopPropagation();
        setEditingId(conv.id);
        setEditingTitle(conv.title);
    };

    const confirmRename = async (id: string) => {
        const title = editingTitle.trim();
        if (!title) return;
        await apiService.renameConversation(id, title);
        setConversations(prev => prev.map(c => c.id === id ? { ...c, title } : c));
        setEditingId(null);
    };

    // ─── Send Message ─────────────────────────────────────────────────────────

    const handleSend = async (text?: string) => {
        const messageText = (text || input).trim();
        if (!messageText) return;

        // Ensure there's an active conversation
        let convId = activeConversationId;
        if (!convId) {
            const conv = await apiService.createConversation(messageText.slice(0, 60));
            setConversations(prev => [conv, ...prev]);
            setActiveConversationId(conv.id);
            convId = conv.id;
        }

        // Optimistic UI: add user message immediately
        const optimisticMsg: ChatMessage = {
            id: `temp-${Date.now()}`,
            role: 'user',
            content: messageText,
            timestamp: new Date().toISOString(),
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await apiService.sendAIMessage(messageText, convId);

            const aiMsg: ChatMessage = {
                id: `ai-${Date.now()}`,
                role: 'assistant',
                content: response.message || "Désolé, je n'ai pas pu traiter votre demande.",
                timestamp: response.timestamp,
            };

            setMessages(prev => [...prev, aiMsg]);

            // Update sidebar preview
            setConversations(prev => prev.map(c =>
                c.id === convId
                    ? { ...c, updated_at: response.timestamp, last_message: { role: 'assistant', content: aiMsg.content, timestamp: response.timestamp } }
                    : c
            ));

            if (!isMuted) {
                playNotificationSound();
                setTimeout(() => speakText(aiMsg.content), 400);
            }
            if (notificationsEnabled && document.hidden) {
                sendSystemNotification('NEURIVA a répondu', { body: aiMsg.content });
            }
        } catch (error: any) {
            const errMsg: ChatMessage = {
                id: `err-${Date.now()}`,
                role: 'assistant',
                content: `❌ Erreur : ${error.message || 'Impossible de contacter l\'IA. Réessayez.'}`,
                timestamp: new Date().toISOString(),
            };
            setMessages(prev => [...prev, errMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const toggleMute = () => {
        const next = !isMuted;
        setIsMuted(next);
        localStorage.setItem('neuriva_muted', String(next));
        if (next) window.speechSynthesis?.cancel();
    };

    const toggleNotifications = async () => {
        if (!notificationsEnabled) {
            const granted = await requestNotificationPermission();
            setNotificationsEnabled(granted);
        } else {
            setNotificationsEnabled(false);
        }
    };

    // ─── Sub-components ───────────────────────────────────────────────────────

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Sidebar Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-primary-500" />
                    Conversations
                </h2>
                <button
                    onClick={createNewConversation}
                    title="Nouvelle conversation"
                    className="p-1.5 rounded-lg hover:bg-primary-500/20 text-primary-400 hover:text-primary-300 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>

            {/* Conversation List */}
            <div className="flex-1 overflow-y-auto py-2 space-y-1 px-2 custom-scrollbar">
                {isLoadingConversations ? (
                    <div className="space-y-2 p-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-14 rounded-xl bg-white/5 animate-pulse" />
                        ))}
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="text-center py-10 px-4">
                        <MessageSquare className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                        <p className="text-xs text-slate-500">Aucune conversation</p>
                        <button
                            onClick={createNewConversation}
                            className="mt-3 text-xs text-primary-400 hover:text-primary-300 transition-colors"
                        >
                            Commencer ici
                        </button>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {conversations.map(conv => (
                            <motion.div
                                key={conv.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                onClick={() => selectConversation(conv.id)}
                                className={`group relative px-3 py-2.5 rounded-xl cursor-pointer transition-all ${activeConversationId === conv.id
                                    ? 'bg-primary-500/15 border border-primary-500/30'
                                    : 'hover:bg-white/5 border border-transparent'
                                    }`}
                            >
                                {editingId === conv.id ? (
                                    <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                                        <input
                                            autoFocus
                                            value={editingTitle}
                                            onChange={e => setEditingTitle(e.target.value)}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter') confirmRename(conv.id);
                                                if (e.key === 'Escape') setEditingId(null);
                                            }}
                                            className="flex-1 bg-white/10 rounded px-2 py-0.5 text-sm text-white outline-none"
                                        />
                                        <button onClick={() => confirmRename(conv.id)} className="text-emerald-400 hover:text-emerald-300 p-0.5"><Check className="w-3.5 h-3.5" /></button>
                                        <button onClick={() => setEditingId(null)} className="text-slate-400 hover:text-slate-300 p-0.5"><X className="w-3.5 h-3.5" /></button>
                                    </div>
                                ) : (
                                    <>
                                        <p className="text-sm font-medium text-white truncate pr-12">{conv.title}</p>
                                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                                            {conv.last_message?.content || 'Vide'} · {formatRelativeTime(conv.updated_at)}
                                        </p>
                                        {/* Actions */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={e => startRename(e, conv)} className="p-1.5 hover:bg-white/10 rounded-md text-slate-400 hover:text-white transition-colors">
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button onClick={e => deleteConversation(e, conv.id)} className="p-1.5 hover:bg-red-500/20 rounded-md text-slate-400 hover:text-red-400 transition-colors">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </div>
    );

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="flex h-dvh md:h-dvh bg-background overflow-hidden">

            {/* ── Desktop Sidebar ─────────────────────────────── */}
            <AnimatePresence>
                {showSidebar && (
                    <motion.aside
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 260, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="hidden md:flex flex-col bg-white/[0.02] border-r border-white/5 overflow-hidden shrink-0"
                    >
                        <div className="w-[260px]">
                            <SidebarContent />
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            {/* ── Main Chat Area ───────────────────────────────── */}
            <div className="flex-1 flex flex-col min-w-0">

                {/* Header */}
                <div className="shrink-0 px-4 md:px-6 py-3 border-b border-white/5 bg-background/60 backdrop-blur-md flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                        {/* Toggle sidebar (desktop) / back button (mobile) */}
                        <button
                            onClick={() => mobilePanel === 'history' ? setMobilePanel('chat') : setShowSidebar(!showSidebar)}
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white hidden md:block"
                        >
                            <ChevronLeft className={`w-5 h-5 transition-transform ${showSidebar ? '' : 'rotate-180'}`} />
                        </button>

                        {/* AI Avatar */}
                        <div className="relative shrink-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <Brain className="w-4 h-4 text-white" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-background flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            </div>
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-base font-bold leading-tight">NEURIVA IA</h1>
                            <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-medium">Connecté · Contexte actif</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                        {/* Mobile: History toggle */}
                        <button
                            onClick={() => setMobilePanel(p => p === 'chat' ? 'history' : 'chat')}
                            className="md:hidden p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400"
                        >
                            <MessageSquare className="w-5 h-5" />
                        </button>

                        {/* New chat */}
                        <button onClick={createNewConversation} title="Nouveau chat" className="p-2 hover:bg-white/5 rounded-lg transition-colors text-slate-400 hover:text-white">
                            <Plus className="w-5 h-5" />
                        </button>

                        <button onClick={toggleNotifications} className="p-2 hover:bg-white/5 rounded-lg transition-colors hidden md:block" title="Notifications">
                            {notificationsEnabled
                                ? <Bell className="w-5 h-5 text-primary-400" />
                                : <BellOff className="w-5 h-5 text-slate-400" />}
                        </button>

                        <button onClick={toggleMute} className="p-2 hover:bg-white/5 rounded-lg transition-colors" title="Son">
                            {!isMuted
                                ? <Volume2 className="w-5 h-5 text-primary-400" />
                                : <VolumeX className="w-5 h-5 text-slate-400" />}
                        </button>
                    </div>
                </div>

                {/* ── Mobile History Panel ─────────────────────── */}
                {mobilePanel === 'history' && (
                    <div className="md:hidden flex-1 overflow-hidden">
                        <SidebarContent />
                    </div>
                )}

                {/* ── Messages Area ────────────────────────────── */}
                {mobilePanel === 'chat' && (
                    <>
                        <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6 space-y-6 custom-scrollbar">
                            {isLoadingMessages ? (
                                <div className="flex flex-col gap-4 py-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className={`flex gap-3 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}>
                                            <div className="w-9 h-9 rounded-full bg-white/5 animate-pulse shrink-0" />
                                            <div className={`h-16 rounded-2xl bg-white/5 animate-pulse ${i % 2 === 0 ? 'w-2/3 ml-auto' : 'w-3/4'}`} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <>
                                    {/* Empty state */}
                                    {messages.length === 0 && !isTyping && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="flex flex-col items-center justify-center h-full text-center py-16 px-4"
                                        >
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500/20 to-secondary-500/20 border border-primary-500/20 flex items-center justify-center mb-4">
                                                <Sparkles className="w-8 h-8 text-primary-400" />
                                            </div>
                                            <h2 className="text-xl font-bold mb-2">Bonjour, je suis NEURIVA</h2>
                                            <p className="text-slate-400 text-sm max-w-sm mb-6">
                                                Votre assistant IA pour la productivité. Posez-moi n'importe quelle question sur vos tâches, votre journée ou votre charge mentale.
                                            </p>
                                            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
                                                {suggestions.map((s, i) => (
                                                    <motion.button
                                                        key={i}
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.1 * i }}
                                                        onClick={() => handleSend(s)}
                                                        className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-primary-500/10 hover:border-primary-500/30 transition-all text-sm text-slate-300 hover:text-white flex items-center gap-2"
                                                    >
                                                        <Zap className="w-3.5 h-3.5 text-primary-400" />
                                                        {s}
                                                    </motion.button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}

                                    {/* Messages */}
                                    <AnimatePresence initial={false}>
                                        {messages.map(message => (
                                            <motion.div
                                                key={message.id}
                                                initial={{ opacity: 0, y: 16 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                            >
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === 'assistant'
                                                    ? 'bg-gradient-to-br from-primary-600/20 to-secondary-600/20 border border-primary-500/30'
                                                    : 'bg-white/5 border border-white/10'
                                                    }`}>
                                                    {message.role === 'assistant'
                                                        ? <Brain className="w-4 h-4 text-primary-400" />
                                                        : <User className="w-4 h-4 text-slate-400" />}
                                                </div>

                                                <div className={`flex flex-col max-w-[82%] md:max-w-[70%] ${message.role === 'user' ? 'items-end' : 'items-start'}`}>
                                                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${message.role === 'assistant'
                                                        ? 'bg-white/5 border border-white/10 hover:border-primary-500/20'
                                                        : 'bg-primary-500/15 border border-primary-500/20'
                                                        } transition-colors`}>
                                                        {formatContent(message.content)}
                                                    </div>
                                                    <span className="text-[10px] text-slate-600 mt-1 px-1">
                                                        {new Date(message.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </>
                            )}

                            {/* Typing indicator */}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 items-center">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-600/20 to-secondary-600/20 border border-primary-500/30 flex items-center justify-center">
                                        <Brain className="w-4 h-4 text-primary-400" />
                                    </div>
                                    <div className="px-4 py-3 rounded-2xl bg-white/5 border border-white/10 flex gap-1.5 items-center">
                                        {[0, 0.15, 0.3].map((delay, i) => (
                                            <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: `${delay}s` }} />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="shrink-0 p-4 md:p-5 border-t border-white/5 bg-background/60 backdrop-blur-sm">
                            <div className="max-w-4xl mx-auto flex gap-3 items-end relative">
                                <textarea
                                    ref={inputRef}
                                    value={input}
                                    onChange={e => {
                                        setInput(e.target.value);
                                        e.target.style.height = 'auto';
                                        e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                                    }}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Interrogez votre cerveau exécutif..."
                                    className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-primary-500/40 focus:border-primary-500/40 transition-all resize-none min-h-[48px] max-h-[120px] text-sm"
                                    rows={1}
                                />
                                <button
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isTyping}
                                    className={`shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-all ${input.trim() && !isTyping
                                        ? 'bg-primary-500 hover:bg-primary-400 shadow-lg shadow-primary-500/30 text-white'
                                        : 'bg-white/5 text-slate-600 cursor-not-allowed'
                                        }`}
                                >
                                    {isTyping ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
