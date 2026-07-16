import Sidebar from '@/components/layout/Sidebar';
import BottomNav from '@/components/layout/BottomNav';

export default function TasksLayout({
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
