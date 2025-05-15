module.exports = {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './public/index.html',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#EF4444', // Tomato Red
        },
        secondary: {
          DEFAULT: '#10B981', // Leaf Green
        },
        background: {
          DEFAULT: '#FAFAFA', // Off-White
          dark: '#1F2937', // Dark background for dark mode
        },
        text: {
          DEFAULT: '#3B2F2F', // Dark Brown
          light: '#E5E7EB', // Light text for dark mode
        },
        muted: {
          DEFAULT: '#9CA3AF', // Muted Gray
        },
        accent: {
          DEFAULT: '#f43f5e', // Custom Accent Color
        },
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', 'ui-sans-serif', 'system-ui'],
      },
    },
  },
  plugins: [],
}; 