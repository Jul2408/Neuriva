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
        <div className="flex min-h-screen bg-background text-white">
            <GlobalTaskReminder />
            <Sidebar />
            <main className="flex-1 pb-28 md:pb-0 overflow-y-auto h-screen relative w-full overflow-x-hidden">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
