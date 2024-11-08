/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/index.html",    // Specify only index.html if no JS files are present
    "./src/styles.css"     // Including styles.css to ensure Tailwind recognizes all files
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
