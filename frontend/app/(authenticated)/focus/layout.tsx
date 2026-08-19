export default function FocusLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Le layout parent (authenticated) fournit déjà Sidebar et BottomNav
    return <>{children}</>;
}
