import colors from 'tailwindcss/colors'

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: colors.blue,
        accent: colors.orange,
      },
    },
  },
  plugins: [],
}



