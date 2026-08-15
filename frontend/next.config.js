/** @type {import('next').NextConfig} */

const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    disable: process.env.NODE_ENV === 'development',
    register: true,
    skipWaiting: true,
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    workboxOptions: {
        disableDevLogs: true,
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'google-fonts-cache',
                    expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
                    cacheableResponse: { statuses: [0, 200] },
                },
            },
            {
                urlPattern: /^http:\/\/localhost:8000\/api\/(tasks|dashboard|notifications)\//i,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'api-cache',
                    expiration: { maxEntries: 32, maxAgeSeconds: 60 * 5 },
                    networkTimeoutSeconds: 5,
                },
            },
        ],
    },
    fallbacks: {
        document: '/offline',
    },
});

const nextConfig = {
    reactStrictMode: true,
    poweredByHeader: false,
    // Silence the Turbopack + webpack plugin coexistence warning (Next.js 16+).
    // The PWA plugin injects webpack config which is fine — we don't need custom
    // Turbopack rules, so an empty object is sufficient.
    turbopack: {},
    experimental: {
        serverActions: {},
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-DNS-Prefetch-Control', value: 'on' },
                    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
                ],
            },
        ];
    },
};

module.exports = withPWA(nextConfig);
