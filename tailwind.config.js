/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        institucional: {
          azul: "#1e3a6e",
          verde: "#3fa34d",
          amarelo: "#f2c230",
        },
      },
    },
  },
  plugins: [],
};
