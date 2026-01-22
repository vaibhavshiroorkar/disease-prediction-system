/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // BioSentinel brand colors
                sentinel: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#14532d',
                },
                threat: {
                    low: '#22c55e',
                    moderate: '#f59e0b',
                    high: '#ef4444',
                },
                dark: {
                    900: '#0a0a0f',
                    800: '#12121a',
                    700: '#1a1a24',
                    600: '#24242f',
                    500: '#2e2e3a',
                }
            },
            animation: {
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
            },
            boxShadow: {
                'glow-green': '0 0 20px rgba(34, 197, 94, 0.4)',
                'glow-amber': '0 0 20px rgba(245, 158, 11, 0.4)',
                'glow-red': '0 0 30px rgba(239, 68, 68, 0.5)',
            }
        },
    },
    plugins: [],
}
