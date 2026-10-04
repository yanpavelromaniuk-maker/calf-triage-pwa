import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        triage: {
          emergency: '#B91C1C', // red-700
          urgent: '#C2410C', // orange-700
          prompt: '#A16207', // yellow-700
          monitor: '#15803D', // green-700
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
