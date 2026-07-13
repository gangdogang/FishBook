/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 실제 색값은 src/index.css의 CSS 변수(:root / .dark)에서 정의 — 다크모드 대응
        sea: {
          DEFAULT: 'rgb(var(--c-sea) / <alpha-value>)',
          soft: 'rgb(var(--c-sea-soft) / <alpha-value>)',
          deep: 'rgb(var(--c-sea-deep) / <alpha-value>)'
        },
        ink: {
          DEFAULT: 'rgb(var(--c-ink) / <alpha-value>)',
          mute: 'rgb(var(--c-ink-mute) / <alpha-value>)'
        },
        mist: 'rgb(var(--c-mist) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        chipbg: 'rgb(var(--c-chipbg) / <alpha-value>)',
        star: 'rgb(var(--c-star) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)'
      },
      borderRadius: {
        card: '14px',
        btn: '10px'
      },
      maxWidth: {
        content: '980px'
      },
      spacing: {
        '1.75': '7px',
        '3.25': '13px',
        '4.5': '18px',
        '5.5': '22px'
      },
      fontSize: {
        // px 고정 타이포 스케일 — 임의값(text-[13px] 등) 대신 사용
        10: '10px',
        11: '11px',
        12.5: '12.5px',
        13: '13px',
        14: '14px',
        14.5: '14.5px',
        15: '15px',
        17: '17px',
        18: '18px',
        19: '19px',
        20: '20px',
        24: '24px',
        28: '28px',
        30: '30px'
      },
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', 'sans-serif']
      }
    }
  },
  plugins: [],
};
