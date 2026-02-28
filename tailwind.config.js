/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#ef4444',
                    dark: '#dc2626',
                },
                secondary: {
                    DEFAULT: '#0a0a0a',
                    light: '#171717',
                }
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
