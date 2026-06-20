import "./globals.css";

export const metadata = {
  title: "Sistema DAP — SEMUSA",
  description: "Painel de Controle e Consulta Inteligente do DAP",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
