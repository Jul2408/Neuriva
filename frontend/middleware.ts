import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const response = NextResponse.next();

    // Extract just the ORIGIN (protocol + host) from the API URL.
    // CSP path matching is EXACT — putting https://host.com/api would block
    // https://host.com/api/auth/login/ (subdirectory). We need just the origin.
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    let apiOrigin = apiUrl;
    try {
        apiOrigin = new URL(apiUrl).origin; // e.g. https://jul24.pythonanywhere.com
    } catch (_) {
        // fallback: use as-is
    }

    const cspHeader = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://accounts.google.com",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' blob: data: https://*.googleusercontent.com https://accounts.google.com",
        "font-src 'self'",
        "frame-src 'self' https://accounts.google.com",
        `connect-src 'self' ${apiOrigin} https://accounts.google.com`,
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
    ].join('; ');

    response.headers.set('Content-Security-Policy', cspHeader);
    response.headers.set('X-Frame-Options', 'DENY');

    return response;
}

export const config = {
    matcher: [
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
