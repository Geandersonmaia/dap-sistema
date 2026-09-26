/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx}", "./components/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        // Paleta Projeto Goa: CBMRO + aviação
        goa: {
          noite: "#0E2238", // céu noturno / cabine: cabeçalho e fundos escuros
          noite2: "#17324F",
          vermelho: "#C8102E", // vermelho bombeiro: ações principais
          vermelhoEsc: "#9E0C24",
          dourado: "#D4A537", // dourado do brasão: destaques e codinomes
          fuselagem: "#F4F6F8", // branco de fuselagem: fundo do app
          hangar: "#5B6770", // cinza hangar: textos secundários
          linha: "#DCE1E6",
          verde: "#2E8B57", // confirmado / disponível
          ambar: "#D99A00", // aguardando / manutenção
        },
      },
      fontFamily: {
        display: ['"Barlow Condensed"', '"Arial Narrow"', "Arial", "sans-serif"],
        sans: ['"IBM Plex Sans"', "system-ui", "-apple-system", '"Segoe UI"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
