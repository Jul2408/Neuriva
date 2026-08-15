import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function ProfileLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-background text-white">
            <Sidebar />
            <main className="flex-1 pb-28 md:pb-0 w-full overflow-x-hidden relative">
                {children}
            </main>
            <BottomNav />
        </div>
    );
}
