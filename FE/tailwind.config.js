/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#E6F4F2',
          100: '#E6F4F2',
          500: '#0F9488',
          600: '#0F9488',
          700: '#0B7C72'
        },
        ink: '#1A1D1F',
        muted: '#6B7280',
        faint: '#9AA0A6',
        line: '#E8EBED',
        accent: '#F2A93B'
      },
      fontFamily: {
        sans: ['Pretendard', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif']
      },
      borderRadius: {
        lg: '16px',
        card: '16px'
      },
      boxShadow: {
        soft: '0 10px 28px rgba(15, 148, 136, 0.12)'
      }
    }
  },
  plugins: [],
};
