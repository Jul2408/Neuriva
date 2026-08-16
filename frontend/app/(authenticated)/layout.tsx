'use client';

import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';
import GlobalTaskReminder from '@/components/layout/GlobalTaskReminder';

export default function AuthenticatedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-white relative selection:bg-primary-500/30">
            {/* Ambient Background for Ultra Realistic Look */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-600/15 rounded-full blur-[150px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-secondary-600/15 rounded-full blur-[150px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.06] mix-blend-overlay"></div>
            </div>

            <GlobalTaskReminder />
            <Sidebar />
            <main className="flex-1 pb-28 md:pb-0 overflow-y-auto h-screen relative w-full overflow-x-hidden">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
