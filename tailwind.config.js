/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fff4ed', 100: '#ffe5d3', 200: '#ffc8a7', 300: '#ffa270', 400: '#ff743b', 500: '#f95b15', 600: '#eb4206', 700: '#c33006', 800: '#9b260e', 900: '#7d2210', 950: '#430d05'
        },
        secondary: {
          50: '#f4f0ff', 100: '#ece3ff', 200: '#dbcdff', 300: '#c1adff', 400: '#a381ff', 500: '#874bff', 600: '#7213e2', 700: '#6409cc', 800: '#5408aa', 900: '#450789', 950: '#2b035e'
        },
        success: {
          50: '#f0fdf3', 100: '#dcfce5', 200: '#bcf6cd', 300: '#86eab0', 400: '#4bd586', 500: '#22ba62', 600: '#0ca82a', 700: '#117b38', 800: '#136130', 900: '#115029', 950: '#052c14'
        },
        // Force other colors to map to these three
        emerald: {
          50: '#f0fdf3', 100: '#dcfce5', 200: '#bcf6cd', 300: '#86eab0', 400: '#4bd586', 500: '#22ba62', 600: '#0ca82a', 700: '#117b38', 800: '#136130', 900: '#115029', 950: '#052c14'
        },
        red: {
          50: '#fff4ed', 100: '#ffe5d3', 200: '#ffc8a7', 300: '#ffa270', 400: '#ff743b', 500: '#f95b15', 600: '#eb4206', 700: '#c33006', 800: '#9b260e', 900: '#7d2210', 950: '#430d05'
        },
        amber: {
          50: '#fff4ed', 100: '#ffe5d3', 200: '#ffc8a7', 300: '#ffa270', 400: '#ff743b', 500: '#f95b15', 600: '#eb4206', 700: '#c33006', 800: '#9b260e', 900: '#7d2210', 950: '#430d05'
        },
        purple: {
          50: '#f4f0ff', 100: '#ece3ff', 200: '#dbcdff', 300: '#c1adff', 400: '#a381ff', 500: '#874bff', 600: '#7213e2', 700: '#6409cc', 800: '#5408aa', 900: '#450789', 950: '#2b035e'
        },
        rose: {
          50: '#fff4ed', 100: '#ffe5d3', 200: '#ffc8a7', 300: '#ffa270', 400: '#ff743b', 500: '#f95b15', 600: '#eb4206', 700: '#c33006', 800: '#9b260e', 900: '#7d2210', 950: '#430d05'
        },
        blue: {
          50: '#f4f0ff', 100: '#ece3ff', 200: '#dbcdff', 300: '#c1adff', 400: '#a381ff', 500: '#874bff', 600: '#7213e2', 700: '#6409cc', 800: '#5408aa', 900: '#450789', 950: '#2b035e'
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(to bottom right, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
    },
  },
  plugins: [],
}

