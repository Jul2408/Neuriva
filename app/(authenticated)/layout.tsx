'use client';

import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-white">
            <Sidebar />
            {/* Ajout d'un grand padding pb-32 pour dégager la zone de la barre flottante sur mobile */}
            <main className="flex-1 pb-32 md:pb-0 overflow-y-auto h-screen relative">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
