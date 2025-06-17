/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'board-brown': '#8B4513',
        'board-light': '#DEB887',
        'piece-white': '#F5F5F5',
        'piece-black': '#2C2C2C',
      },
      animation: {
        'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 1s infinite',
      }
    },
  },
  plugins: [],
} 