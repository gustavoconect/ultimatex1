/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                hex: {
                    gold: {
                        100: '#f0e6d2',
                        300: '#c8aa6e',
                        500: '#c89b3c',
                        700: '#785a28',
                    },
                    blue: {
                        300: '#0ac8b9',
                        500: '#0397ab',
                        900: '#01262d',
                    },
                    dark: {
                        100: '#1e2328',
                        300: '#0f1219',
                        500: '#090a11',
                    },
                    magic: '#cd3c77',
                    tech: '#2b2a29' // Metal grey
                },
                // Semantic mappings
                primary: "#c89b3c",   // Gold
                secondary: "#0397ab", // Blue
                bgDark: "#0f1219",
                cardBg: "#1e2328",
                available: "#0ac8b9",
                banned: "#ef4444",    // Red
                selected: "#c8aa6e",  // Gold
            },
            fontFamily: {
                outfit: ['"Outfit"', "sans-serif"],
                display: ['"Beaufort LoL"', '"Outfit"', "sans-serif"],
            },
            backgroundImage: {
                'hex-gradient': 'linear-gradient(135deg, #1e2328 0%, #0f1219 100%)',
                'gold-gradient': 'linear-gradient(to bottom, #c8aa6e, #785a28)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'hex-pulse': 'hexPulse 2s infinite',
                'float': 'float 3s ease-in-out infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0', transform: 'translateY(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                hexPulse: {
                    '0%': { boxShadow: '0 0 0 0 rgba(200, 155, 60, 0.4)' },
                    '70%': { boxShadow: '0 0 0 10px rgba(200, 155, 60, 0)' },
                    '100%': { boxShadow: '0 0 0 0 rgba(200, 155, 60, 0)' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-5px)' },
                },
                glow: {
                    'from': { boxShadow: '0 0 5px rgba(3, 151, 171, 0.2)' },
                    'to': { boxShadow: '0 0 20px rgba(3, 151, 171, 0.6), 0 0 10px rgba(3, 151, 171, 0.4)' },
                }
            }
        },
    },
    plugins: [],
}
