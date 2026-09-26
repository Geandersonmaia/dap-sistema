// Ícones de traço no estilo SF Symbols
const P = {
  aviao: "M2.5 13.5 10 11V5.5a2 2 0 0 1 4 0V11l7.5 2.5v2L14 14v4l2.5 2v1.5L12 20.5l-4.5 1V20L10 18v-4l-7.5 1.5z",
  helicoptero: "M3 5h18M12 5v3M6 11h9a4 4 0 0 1 0 8H9a3 3 0 0 1-3-3zm0 0H2m6 8v2m6-2v2m-8 0h10",
  mais: "M12 5v14M5 12h14",
  pessoas: "M16 19v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 17.5V19M10 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Zm10 8v-1.5a3.5 3.5 0 0 0-2.5-3.35M15.5 4.15a3.5 3.5 0 0 1 0 6.7",
  painel: "M4 4h7v7H4zm9 0h7v4h-7zm0 6h7v10h-7zM4 13h7v7H4z",
  documento: "M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zm0 0v5h5M9 13h6m-6 4h6",
  copiar: "M9 9h10v12H9zM5 15V3h10",
  microfone: "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3Zm-7 9a7 7 0 0 0 14 0M12 19v3",
  check: "M5 12.5 10 17.5 19.5 7",
  x: "M6 6l12 12M18 6 6 18",
  trocar: "M4 8h14l-3-3m5 11H6l3 3",
  voltar: "M15 5l-7 7 7 7",
  relogio: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  rota: "M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM6 15V9a3 3 0 0 1 3-3h7M18 9v6a3 3 0 0 1-3 3H8",
  hospital: "M4 21V6l8-3 8 3v15M9 21v-5h6v5M12 8v5m-2.5-2.5h5",
  paciente: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 9a7 7 0 0 1 14 0",
  sair: "M15 17l5-5-5-5m5 5H9m3 9H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6",
  enviar: "M21 3 10 14M21 3l-7 18-4-7-7-4z",
  chevron: "M9 6l6 6-6 6",
};

export default function Icone({ nome, className = "h-6 w-6", traco = 1.8 }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={traco} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={P[nome]} />
    </svg>
  );
}

// Ícone do WhatsApp (preenchido)
export function IconeWhatsApp({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.2-1.2-.1-.1-.3-.2-.5-.3Z" />
    </svg>
  );
}
