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
                    DEFAULT: '#E63946', // Emergency Red
                    dark: '#D62828',
                },
                secondary: {
                    DEFAULT: '#1D3557', // Dark Blue
                    light: '#457B9D',
                },
                medical: {
                    bg: '#F1FAEE',
                    accent: '#A8DADC',
                }
            },
            borderRadius: {
                'xl': '1rem',
                '2xl': '1.5rem',
                '3xl': '2rem',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                poppins: ['Poppins', 'sans-serif'],
                manrope: ['Manrope', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
