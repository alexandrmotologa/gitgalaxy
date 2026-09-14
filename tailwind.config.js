/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        galaxy: {
          950: '#030712',
          900: '#0b0f19',
          850: '#111827',
          800: '#1f2937',
          cyan: '#06b6d4',
          neon: '#00f0ff',
          amber: '#f59e0b',
          crimson: '#ef4444',
          magenta: '#f43f5e',
          purple: '#8b5cf6',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'laser-glow': 'laser 1.5s ease-out infinite',
      },
      keyframes: {
        laser: {
          '0%': { opacity: '0.2', transform: 'scale(0.98)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' },
          '100%': { opacity: '0.2', transform: 'scale(0.98)' },
        }
      }
    },
  },
  plugins: [],
}
