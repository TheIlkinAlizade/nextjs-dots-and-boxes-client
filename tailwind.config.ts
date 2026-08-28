import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
        display: ['var(--font-poppins)', 'sans-serif'],
      },
      colors: {
        base: '#000000',
        panel: '#302E2B',
        panelDark: '#1E1C1A',
        accent: '#81B64C',
        accentHover: '#6F9C40',
        boardLight: '#EEEED2',
        boardDark: '#769656',
        muted: '#B5B3AE',
      },
    },
  },
  plugins: [],
};
export default config;