/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        color: {
          gray1: 'rgb(var(--color-gray1) / <alpha-value>)',
          gray2: 'rgb(var(--color-gray2) / <alpha-value>)',
          gray3: 'rgb(var(--color-gray3) / <alpha-value>)',
          white: 'rgb(var(--color-white) / <alpha-value>)',
          white1: '#F5F5F5',
          white2: '#FDFDFD',
          white3: '#FFFFFF',
          purple: '#8878F0',
          green: '#46EA8D',
          red: '#EE2F32',
          warning: "#EAE546",
          pink: "#F078E4",
        }
      }
    },
  },
  plugins: [],
}

