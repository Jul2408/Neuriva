import type { Metadata } from 'next';
import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export const metadata: Metadata = {
    title: 'Dashboard | NEURIVA',
    description: 'Votre tableau de bord intelligent',
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-white">
            <Sidebar />
            <main className="flex-1 pb-20 md:pb-0">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
