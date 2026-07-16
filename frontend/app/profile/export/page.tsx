'use client';

'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, ChevronLeft, FileJson, FileSpreadsheet } from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/lib/api/apiService';

export default function ExportPage() {
    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Retour au profil
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                        <Download className="w-8 h-8 text-primary-400" />
                        Export des données
                    </h1>
                    <p className="text-slate-400">Récupérez une copie de toutes vos données</p>
                </div>

                <Card className="p-6">
                    <div className="mb-6">
                        <h3 className="text-lg font-bold mb-2">Vos archives</h3>
                        <p className="text-slate-400 text-sm">
                            L'export contient vos tâches, vos statistiques d'historique et vos préférences.
                            Le processus peut prendre quelques minutes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={async () => {
                                try {
                                    const blob = await apiService.exportData();
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement('a');
                                    a.href = url;
                                    a.download = `neuriva-export-${new Date().toISOString().split('T')[0]}.json`;
                                    document.body.appendChild(a);
                                    a.click();
                                    document.body.removeChild(a);
                                } catch (e) {
                                    alert('Erreur lors de l\'export');
                                }
                            }}
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/10 hover:bg-slate-800 transition-colors text-left group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <FileJson className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <span className="font-bold block">Format JSON</span>
                                <span className="text-xs text-slate-500">Pour les développeurs</span>
                            </div>
                        </button>

                        <button
                            disabled
                            className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/50 border border-white/10 opacity-50 cursor-not-allowed text-left group"
                        >
                            <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <FileSpreadsheet className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <span className="font-bold block">Format CSV</span>
                                <span className="text-xs text-slate-500">Bientôt disponible</span>
                            </div>
                        </button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
