'use client';

import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trash2, ChevronLeft, AlertOctagon } from 'lucide-react';
import Link from 'next/link';
import { apiService } from '@/lib/api/apiService';

export default function DeletePage() {
    return (
        <div className="min-h-screen bg-background text-white p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
                <Link href="/profile" className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors">
                    <ChevronLeft className="w-4 h-4" />
                    Retour au profil
                </Link>

                <div className="mb-8">
                    <h1 className="text-3xl font-display font-bold mb-2 flex items-center gap-3 text-red-500">
                        <Trash2 className="w-8 h-8" />
                        Supprimer le compte
                    </h1>
                    <p className="text-slate-400">Zone de danger</p>
                </div>

                <Card className="p-6 border-red-900/50 bg-red-950/10">
                    <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-full bg-red-900/20 flex-shrink-0 flex items-center justify-center">
                            <AlertOctagon className="w-6 h-6 text-red-500" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-lg font-bold text-white">Cette action est irréversible</h3>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                La suppression de votre compte entraînera la perte définitive de :
                            </p>
                            <ul className="list-disc list-inside text-slate-400 text-sm space-y-1 ml-2">
                                <li>Toutes vos tâches et projets</li>
                                <li>Votre historique de concentration et statistiques</li>
                                <li>Vos préférences et personnalisations</li>
                                <li>Votre abonnement Premium (si actif)</li>
                            </ul>

                            <div className="pt-4">
                                <Button
                                    variant="primary"
                                    className="bg-red-600 hover:bg-red-700 border-none text-white w-full md:w-auto"
                                    onClick={async () => {
                                        if (confirm("Êtes-vous ABSOLUMENT certain ? Cette action est irréversible.")) {
                                            if (prompt("Tapez 'SUPPRIMER' pour confirmer") === 'SUPPRIMER') {
                                                try {
                                                    await apiService.deleteAccount();
                                                    window.location.href = '/';
                                                } catch (e) {
                                                    alert("Échec de la suppression.");
                                                }
                                            }
                                        }
                                    }}
                                >
                                    Je comprends, supprimer mon compte
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
