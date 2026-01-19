/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        title: ['var(--font-cinzel-decorative)', 'Georgia', 'serif'],
        body: ['var(--font-manrope)', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold: {
          1: '#F7E7A1',
          2: '#D6A84A',
          3: '#8B5A12',
        },
        mystic: {
          bg: '#1a0f2e',
          bg2: '#2d1b4e',
          text: '#F4EEFF',
          muted: 'rgba(244, 238, 255, 0.70)',
        },
      },
    },
  },
  plugins: [],
}
