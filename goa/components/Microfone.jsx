"use client";

import { useEffect, useRef, useState } from "react";

// Ditado por voz do próprio navegador (Chrome no Android, Safari no iPhone).
// Cada trecho reconhecido é entregue em onTexto.
export default function Microfone({ onTexto, grande = false, rotulo = "Ditar" }) {
  const [suportado, setSuportado] = useState(true);
  const [ouvindo, setOuvindo] = useState(false);
  const rec = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setSuportado(false);
    const r = new SR();
    r.lang = "pt-BR";
    r.continuous = true;
    r.interimResults = false;
    r.onresult = (e) => {
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) onTexto(e.results[i][0].transcript.trim());
      }
    };
    r.onend = () => setOuvindo(false);
    r.onerror = () => setOuvindo(false);
    rec.current = r;
    return () => r.abort();
  }, [onTexto]);

  if (!suportado) return null;

  function alternar() {
    if (ouvindo) return rec.current.stop();
    rec.current.start();
    setOuvindo(true);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={ouvindo}
      aria-label={rotulo || "Ditar por voz"}
      className={
        grande
          ? `flex w-full items-center justify-center gap-3 rounded-xl py-4 font-semibold text-white ${
              ouvindo ? "bg-goa-vermelho animate-pulse" : "bg-goa-noite"
            }`
          : `shrink-0 rounded-lg border px-3 text-sm ${
              ouvindo ? "border-goa-vermelho bg-red-50 text-goa-vermelho" : "border-goa-linha bg-white text-goa-hangar"
            }`
      }
    >
      <IconeMic />
      {ouvindo ? "Ouvindo… toque para parar" : rotulo}
    </button>
  );
}

function IconeMic() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3" strokeLinecap="round" />
    </svg>
  );
}
