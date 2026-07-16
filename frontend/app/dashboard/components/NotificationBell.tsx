'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info, AlertTriangle, CheckCircle2, ChevronRight, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiService } from '@/lib/api/apiService';
import { Card } from '@/components/ui/Card';

interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'info' | 'warning' | 'success';
    created_at: string;
    is_read: boolean;
}

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [userSettings, setUserSettings] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    // Refs for logic
    const lastCountRef = useRef(0);
    const processedTaskIds = useRef<Set<string>>(new Set());
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Load User Settings
    useEffect(() => {
        apiService.getCurrentUser().then(user => {
            setUserSettings(user.notification_settings || {});
        }).catch(console.error);

        // Click outside listener
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Core Logic: Poll & Check Reminders
    useEffect(() => {
        const checkSystem = async () => {
            try {
                // 1. Fetch Backend Notifications
                const data = await apiService.getNotifications();
                const validData = Array.isArray(data) ? data : (data.results || []);
                const serverNotifications = validData.slice(0, 10); // Keep last 10

                let localReminders: Notification[] = [];
                if (userSettings?.push_reminders) {
                    try {
                        const tasksResponse = await apiService.getTasks();
                        const tasks = Array.isArray(tasksResponse) ? tasksResponse : (tasksResponse.results || []);

                        const now = Date.now();

                        tasks.forEach((task: any) => {
                            if (!task.dueDate || task.status === 'done') return;

                            const dueTime = new Date(task.dueDate).getTime();
                            const diff = dueTime - now;
                            const minutesLeft = Math.floor(diff / 60000); // Can be negative if late

                            // Logic Keys
                            const warnKey = `${task.id}_warn`;
                            const dueKey = `${task.id}_due`;

                            // 15 min warning (Trigger between 0 and 15 min)
                            if (minutesLeft <= 15 && minutesLeft > 0 && !processedTaskIds.current.has(warnKey)) {
                                const note: Notification = {
                                    id: `local_${Date.now()}_warn`, // Unique ID
                                    title: "Rappel : Échéance proche",
                                    message: `"${task.title}" expire dans ${minutesLeft} min.`,
                                    type: 'warning',
                                    created_at: new Date().toISOString(),
                                    is_read: false
                                };
                                localReminders.push(note);
                                processedTaskIds.current.add(warnKey);
                                if (soundEnabled) playSound('warning');
                            }
                            // Due Now (Trigger between -1 and 0 min)
                            else if (minutesLeft <= 0 && minutesLeft > -2 && !processedTaskIds.current.has(dueKey)) {
                                const note: Notification = {
                                    id: `local_${Date.now()}_due`,
                                    title: "C'est l'heure !",
                                    message: `La tâche "${task.title}" est arrivée à échéance.`,
                                    type: 'info',
                                    created_at: new Date().toISOString(),
                                    is_read: false
                                };
                                localReminders.push(note);
                                processedTaskIds.current.add(dueKey);
                                if (soundEnabled) playSound('alert');
                            }
                        });
                    } catch (taskError) {
                        console.warn("Failed to fetch tasks for reminders", taskError);
                    }
                }

                // Merge: Existing state must be preserved for local ones not to disappear too fast, 
                // but for simplicity we re-merge active local reminders + server ones.
                // Better approach: Add new local ones to a "local buffer" state? 
                // Simplified: Append new local reminders to current notifications if they are new.

                // For this widget, we will just rebuild the list: Local Reminders (new) + Server.
                // Note: localReminders contains ONLY newly triggered formatted notifications. 
                // We actually want to KEEP previously triggered local reminders if they aren't read.

                // To keep it simple and robust: We rely on server notifications primarily. 
                // Local reminders are immediately "shown" (sound + added to list).
                // However, since we re-fetch server list, we need to manually persist local ones in state 
                // OR push them to backend? Pushing to backend is cleaner but complex (requires endpoint).
                // Let's keep a refs/state for "active local notifications".

                setNotifications(prev => {
                    const existingLocals = prev.filter(n => n.id.startsWith('local_') && !n.is_read);
                    // Filter out duplicates from localReminders just in case
                    const newLocals = localReminders.filter(n => !prev.some(p => p.message === n.message)); // Simple dedup by message

                    const combined = [...newLocals, ...existingLocals, ...serverNotifications];

                    // Sort by date desc
                    return combined.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
                });

                // Sound for new SERVER notification
                const currentUnread = serverNotifications.filter((n: Notification) => !n.is_read).length;
                if (currentUnread > lastCountRef.current && soundEnabled && localReminders.length === 0) { // Don't double beep
                    playSound('ping');
                }
                lastCountRef.current = currentUnread;

            } catch (error) {
                console.error("System Check Failed", error);
            }
        };

        checkSystem();
        const interval = setInterval(checkSystem, 30000);
        return () => clearInterval(interval);
    }, [soundEnabled, userSettings]); // Re-run if settings change

    // Unread Count
    useEffect(() => {
        setUnreadCount(notifications.filter(n => !n.is_read).length);
    }, [notifications]);

    const playSound = (type: 'ping' | 'warning' | 'alert') => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;

        try {
            const ctx = new AudioContext(); // New context every time ensures state is fresh (resumed by interaction usually)
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.connect(gain);
            gain.connect(ctx.destination);

            if (type === 'warning') {
                osc.frequency.setValueAtTime(400, ctx.currentTime);
                osc.frequency.setValueAtTime(0, ctx.currentTime + 0.1); // gap
                osc.frequency.setValueAtTime(400, ctx.currentTime + 0.2);
                gain.gain.setValueAtTime(0.1, ctx.currentTime);
                osc.start();
                osc.stop(ctx.currentTime + 0.4);
            } else if (type === 'alert') {
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.5);
                gain.gain.setValueAtTime(0.15, ctx.currentTime);
                osc.start();
                osc.stop(ctx.currentTime + 0.5);
            } else {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(880, ctx.currentTime);
                osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.05, ctx.currentTime);
                osc.start();
                osc.stop(ctx.currentTime + 0.3);
            }
        } catch (e) {
            console.error("Audio playback failed", e);
        }
    };

    const markAsRead = async (id: string, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (id.startsWith('local_')) {
            setNotifications(prev => prev.filter(n => n.id !== id));
            return;
        }
        try {
            await apiService.updateNotification(id, { is_read: true });
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (error) {
            console.error("Failed to mark read", error);
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/10 group"
            >
                <Bell className={`w-5 h-5 text-slate-400 group-hover:text-white transition-colors ${unreadCount > 0 ? 'animate-wiggle' : ''}`} />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-[#0F172A]">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 top-full mt-4 w-[85vw] max-w-sm md:w-96 z-50 transform origin-top-right"
                    >
                        <Card className="overflow-hidden border-slate-700 shadow-2xl bg-[#0F172A]/95 backdrop-blur-xl">
                            <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                <h3 className="font-bold">Notifications</h3>
                                <button
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                    className="text-xs text-slate-400 hover:text-white transition-colors"
                                >
                                    {soundEnabled ? "🔊 On" : "🔇 Off"}
                                </button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-500">
                                        <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                                        <p className="text-sm">Aucune notification</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-white/5">
                                        {notifications.map((n) => (
                                            <div
                                                key={n.id}
                                                className={`p-4 flex gap-3 hover:bg-white/5 transition-colors relative group ${n.is_read ? 'opacity-50' : ''}`}
                                            >
                                                <div className="mt-0.5">
                                                    {n.type === 'warning' && <AlertTriangle className="w-5 h-5 text-orange-400" />}
                                                    {n.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                                                    {n.type === 'info' && <Info className="w-5 h-5 text-blue-400" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-bold text-slate-200">{n.title}</h4>
                                                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{n.message}</p>
                                                    <span className="text-[10px] text-slate-600 mt-2 block">
                                                        {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                                {!n.is_read && (
                                                    <button
                                                        onClick={(e) => markAsRead(n.id, e)}
                                                        className="absolute right-2 top-2 p-1.5 rounded-full bg-white/10 text-slate-400 hover:bg-primary-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
                                                        title="Marquer comme lu"
                                                    >
                                                        <Check className="w-3 h-3" />
                                                    </button>
                                                )}
                                                {!n.is_read && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary-500 group-hover:opacity-0 transition-opacity" />
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-2 bg-white/5 text-center">
                                    <button
                                        className="text-xs text-slate-400 hover:text-white transition-colors"
                                        onClick={() => setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))}
                                    >
                                        Tout marquer comme lu
                                    </button>
                                </div>
                            )}
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
