'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Construction } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

interface ComingSoonProps {
    title: string;
    description: string;
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
    return (
        <div className="min-h-screen bg-background text-white flex items-center justify-center p-6">
            <Card className="max-w-md w-full p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-primary-500/20 flex items-center justify-center mx-auto mb-6">
                    <Construction className="w-10 h-10 text-primary-400" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-4">{title}</h1>
                <p className="text-slate-400 mb-8">{description}</p>
                <Link href="/dashboard">
                    <Button>Retour au Dashboard</Button>
                </Link>
            </Card>
        </div>
    );
}
