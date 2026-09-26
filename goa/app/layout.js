// No iPhone a fonte é a do sistema (SF Pro); Inter é o substituto no Android
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./globals.css";

export const metadata = {
  title: "GOA · Missões",
  description: "Acionamento de missões do Grupo de Operações Aéreas do CBMRO",
  manifest: "/manifest.json",
  icons: { icon: "/icon-192.png", apple: "/icon-180.png" },
  appleWebApp: { capable: true, title: "GOA Missões", statusBarStyle: "black-translucent" },
};

export const viewport = {
  themeColor: "#050E1F",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
