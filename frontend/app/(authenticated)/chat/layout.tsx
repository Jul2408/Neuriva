export default function ChatLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Le layout parent (authenticated) fournit déjà Sidebar et BottomNav
    return <>{children}</>;
}
