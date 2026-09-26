/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta tirada do brasão do GOA/CBMRO
        goa: {
          noite: "#050E1F", // fundo (céu noturno)
          noite2: "#0B1A36",
          vermelho: "#E0242B", // anel do brasão
          vermelhoEsc: "#B81A20",
          azul: "#2F6BDB", // azul da bandeira de Rondônia (versão luminosa)
          amarelo: "#F7D117", // amarelo da bandeira
          verde: "#22B35A", // verde da bandeira
          dourado: "#E2B04A", // águia
          ambar: "#F5A524",
          texto: "#F2F5FB",
          suave: "#9AA7BF", // texto secundário
        },
      },
      fontFamily: {
        sans: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Text"', "Inter", "system-ui", "sans-serif"],
        display: ["-apple-system", "BlinkMacSystemFont", '"SF Pro Display"', "Inter", "system-ui", "sans-serif"],
      },
      borderRadius: { ios: "22px" },
      keyframes: {
        flutuar: { "0%,100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-4px)" } },
      },
      animation: { flutuar: "flutuar 5s ease-in-out infinite" },
    },
  },
  plugins: [],
};
