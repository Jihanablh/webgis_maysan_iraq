/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
        display: ['Space Grotesk', 'Inter', 'ui-sans-serif'],
      },
      boxShadow: {
        glow: '0 0 45px rgba(112, 214, 190, .18)',
        sand: '0 20px 80px rgba(73, 49, 24, .25)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        drift: 'drift 18s linear infinite',
        pulseSoft: 'pulseSoft 3.2s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        drift: {
          '0%': { transform: 'translate3d(-3%, 0, 0)' },
          '50%': { transform: 'translate3d(3%, -1%, 0)' },
          '100%': { transform: 'translate3d(-3%, 0, 0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '.55' },
          '50%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
