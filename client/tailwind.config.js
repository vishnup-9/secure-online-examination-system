/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff', 100: '#d9e6ff', 200: '#bcd2ff', 300: '#8fb4ff',
          400: '#5c8dff', 500: '#3366ff', 600: '#2347e0', 700: '#1d38b3',
          800: '#1c318f', 900: '#1c2e70'
        },
        surface: {
          DEFAULT: '#ffffff', muted: '#f6f8fb', border: '#e6e9f0'
        },
        ink: {
          900: '#0f172a', 700: '#334155', 500: '#64748b', 400: '#94a3b8'
        },
        risk: {
          low: '#16a34a', medium: '#eab308', high: '#ea580c', critical: '#dc2626'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        card: '0 1px 2px rgba(15,23,42,0.04), 0 4px 16px rgba(15,23,42,0.06)'
      },
      borderRadius: {
        xl: '0.875rem', '2xl': '1.25rem'
      }
    }
  },
  plugins: []
};
