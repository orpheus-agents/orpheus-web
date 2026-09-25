import type { Config } from 'tailwindcss'
import defaultTheme from 'tailwindcss/defaultTheme'

export default {
  content: ['./index.html', './src/**/*.{vue,ts}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        surface: 'rgb(var(--color-surface) / <alpha-value>)',
        'surface-raised': 'rgb(var(--color-surface-raised) / <alpha-value>)',
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        muted: 'rgb(var(--color-muted) / <alpha-value>)',
        line: 'rgb(var(--color-line) / <alpha-value>)',
        brand: 'rgb(var(--color-brand) / <alpha-value>)',
        signal: 'rgb(var(--color-signal) / <alpha-value>)',
        success: 'rgb(var(--color-success) / <alpha-value>)',
        'success-fg': 'rgb(var(--color-success-fg) / <alpha-value>)',
        'success-bg': 'rgb(var(--color-success-bg) / <alpha-value>)',
        warning: 'rgb(var(--color-warning) / <alpha-value>)',
        'warning-fg': 'rgb(var(--color-warning-fg) / <alpha-value>)',
        'warning-bg': 'rgb(var(--color-warning-bg) / <alpha-value>)',
        danger: 'rgb(var(--color-danger) / <alpha-value>)',
        'danger-fg': 'rgb(var(--color-danger-fg) / <alpha-value>)',
        'danger-bg': 'rgb(var(--color-danger-bg) / <alpha-value>)',
      },
      boxShadow: {
        panel: '0 1px 2px rgb(15 23 42 / 0.06)',
      },
      fontFamily: {
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
    },
  },
  plugins: [],
} satisfies Config
