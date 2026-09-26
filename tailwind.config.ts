import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg:        '#0a0a0f',
        surface:   '#111118',
        surface2:  '#1a1a24',
        surface3:  '#222230',
        border:    'rgba(255,255,255,0.08)',
        primary:   '#6366f1',
        accent:    '#06b6d4',
        success:   '#10b981',
        warning:   '#f59e0b',
        danger:    '#ef4444',
        t1:        '#f8fafc',
        t2:        '#94a3b8',
        t3:        '#64748b',
      },
      borderRadius: { xl: '12px', '2xl': '16px', '3xl': '20px' },
      animation: {
        'slide-up':   'slideUp 0.25s ease forwards',
        'slide-down': 'slideDown 0.2s ease forwards',
        'fade-in':    'fadeIn 0.2s ease forwards',
        'scale-in':   'scaleIn 0.15s ease forwards',
        'spin-slow':  'spin 2s linear infinite',
      },
      keyframes: {
        slideUp:   { from: { transform: 'translateY(12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        slideDown: { from: { transform: 'translateY(-12px)', opacity: '0' }, to: { transform: 'translateY(0)', opacity: '1' } },
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        scaleIn:   { from: { transform: 'scale(0.95)', opacity: '0' }, to: { transform: 'scale(1)', opacity: '1' } },
      },
    },
  },
  plugins: [],
}

export default config
