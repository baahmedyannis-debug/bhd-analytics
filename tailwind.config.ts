import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        card: '#111118',
        'card-hover': '#16161f',
        border: 'rgba(255, 255, 255, 0.06)',
        'border-hover': 'rgba(255, 255, 255, 0.12)',
        instagram: '#f0c060',
        tiktok: '#fe2c55',
        soundcloud: '#ff5500',
        spotify: '#1DB954',
        youtube: '#ff0000',
        shotgun: '#00d4aa',
        planning: '#7c3aed',
      },
    },
  },
  plugins: [],
}
export default config
