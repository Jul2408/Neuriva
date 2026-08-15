'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Download, ChevronLeft, FileJson, Trash2, AlertOctagon, Loader2, Database } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';

export default function DataPage() {
    const [isExporting, setIsExporting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            const blob = await apiService.exportData();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `neuriva-export-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            toast.success("Vos données ont été exportées avec succès !");
        } catch (e: any) {
            toast.error(e.message || "Erreur lors de l'export des données");
        } finally {
            setIsExporting(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Êtes-vous ABSOLUMENT certain ? Cette action est irréversible et supprimera toutes vos données.")) {
            return;
        }
        
        const verification = prompt("Tapez 'SUPPRIMER' pour confirmer la suppression définitive de votre compte :");
        if (verification === 'SUPPRIMER') {
            setIsDeleting(true);
            try {
                await apiService.deleteAccount();
                window.location.href = '/auth/login';
            } catch (e: any) {
                toast.error(e.message || "Échec de la suppression du compte.");
                setIsDeleting(false);
            }
        } else if (verification !== null) {
            toast.error("Mot de passe de confirmation incorrect.");
        }
    };

    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Retour au profil
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3">
                        <Database className="w-8 h-8 text-primary-400" />
                        Données & Vie privée
                    </h1>
                    <p className="text-slate-400">Gérez vos données personnelles</p>
                </div>

                <div className="space-y-6">
                    {/* Export Section */}
                    <Card className="p-6">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center shrink-0">
                                <Download className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold mb-1">Exporter mes données</h3>
                                <p className="text-slate-400 text-sm">
                                    Téléchargez une copie complète de toutes vos données NEURIVA (Tâches, Habitudes, Sessions Focus, Conversations IA) au format JSON.
                                </p>
                            </div>
                        </div>

                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="w-full sm:w-auto gap-2 bg-slate-800 hover:bg-slate-700 text-white border border-white/10"
                        >
                            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileJson className="w-4 h-4 text-yellow-400" />}
                            {isExporting ? "Préparation de l'archive..." : "Télécharger l'archive JSON"}
                        </Button>
                    </Card>

                    {/* Delete Section */}
                    <Card className="p-6 border-red-900/50 bg-red-950/10">
                        <div className="flex items-start gap-4 mb-6">
                            <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0">
                                <Trash2 className="w-5 h-5 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-red-500 mb-1">Supprimer le compte</h3>
                                <p className="text-slate-300 text-sm mb-2">
                                    La suppression de votre compte entraînera la perte définitive de toutes vos données sans possibilité de récupération.
                                </p>
                                <ul className="list-disc list-inside text-slate-400 text-xs space-y-1">
                                    <li>Tâches, habitudes et projets</li>
                                    <li>Historique de concentration et IA</li>
                                    <li>Abonnement Premium (le cas échéant)</li>
                                </ul>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 border-none text-white gap-2"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <AlertOctagon className="w-4 h-4" />}
                            {isDeleting ? "Suppression en cours..." : "Supprimer définitivement mon compte"}
                        </Button>
                    </Card>
                </div>
            </div>
        </div>
    );
}
