import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/context/AuthContext";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const outfit = Outfit({ subsets: ["latin"], variable: '--font-outfit' });

export const viewport: Viewport = {
    themeColor: "#8B5CF6",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
};

export const metadata: Metadata = {
    title: "NEURIVA - Cerveau Personnel Intelligent",
    description: "Ton assistant intelligent qui anticipe, organise et réduit ton stress",
    manifest: "/manifest.json",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "NEURIVA",
    },
    formatDetection: {
        telephone: false,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="fr" className="dark scroll-smooth max-w-full overflow-x-hidden">
            <body className={`${inter.variable} ${outfit.variable} font-sans bg-background text-foreground max-w-full overflow-x-hidden`}>
                <AuthProvider>
                    {children}
                    <PWAInstallPrompt />
                    <Toaster theme="dark" position="bottom-right" richColors />
                </AuthProvider>
            </body>
        </html>
    );
}
