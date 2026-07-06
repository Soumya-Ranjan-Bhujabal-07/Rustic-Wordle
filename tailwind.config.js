/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Earthy design system tokens (echoed in our src/index.css v4 @theme directive)
        linen: {
          bg: '#F5F2EB',       // Warm Linen Canvas background
          card: '#FAF7F2',     // Soft Alabaster Card background
        },
        clay: {
          empty: '#E6E0D4',    // Default empty letter tiles
          border: '#D2C9B9',   // Subtle tile borders
        },
        moss: {
          correct: '#8FA88B',  // Desaturated Sage / Moss Green
        },
        ochre: {
          present: '#D4A373',  // Ochre / Soft Terracotta
        },
        ash: {
          absent: '#BCB4A6',   // Warm Ash / Pebble Grey
          dark: '#8C8275',     // Dark ash for disabled keys
        },
        walnut: {
          text: '#3D352E',     // Smoked walnut primary text
          muted: '#7A6F62',    // Soft secondary walnut text
        },
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        shake: 'shake 0.4s ease-in-out',
        pop: 'pop 0.12s ease-out',
        'flip-correct': 'flip-correct 0.6s ease-in-out forwards',
        'flip-present': 'flip-present 0.6s ease-in-out forwards',
        'flip-absent': 'flip-absent 0.6s ease-in-out forwards',
        'fade-in-up': 'fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};
