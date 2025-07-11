/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}", // For App Router
    "./pages/**/*.{js,ts,jsx,tsx}", // For Pages Router
    "./components/**/*.{js,ts,jsx,tsx}", // For components
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FBBC05", // blue-600
        secondary: "#facc15", // yellow-400
        accent: "#10b981", // green-500
        light: "#f9fafb", // gray-50
        dark: "#1f2937", // gray-800
        muted: "#6b7280", // gray-500
      },
    },
  },
  plugins: [],
};
