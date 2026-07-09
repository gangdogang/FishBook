/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        sea: { DEFAULT: '#0F6E84', soft: '#E3F0F3' },
        ink: { DEFAULT: '#1A2B33', mute: '#5F7078' },
        mist: '#F6F8F9',
        line: '#E3EAED',
        chipbg: '#EEF3F5',
        star: '#E0A030'
      },
      borderRadius: {
        card: '14px'
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif']
      }
    }
  },
  plugins: [],
};
