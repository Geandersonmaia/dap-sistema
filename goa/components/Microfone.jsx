"use client";

import { useEffect, useRef, useState } from "react";
import Icone from "./Icone";

// Ditado por voz do próprio navegador (Chrome no Android, Safari no iPhone).
// Cada trecho reconhecido é entregue em onTexto.
export default function Microfone({ onTexto, rotulo = "Ditar por voz" }) {
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
      className={`grid h-[50px] w-[50px] shrink-0 place-items-center rounded-full border transition active:scale-90 ${
        ouvindo
          ? "animate-pulse border-goa-vermelho bg-goa-vermelho text-white shadow-[0_0_20px_rgba(224,36,43,.7)]"
          : "border-white/10 bg-white/[0.08] text-goa-azul"
      }`}
    >
      <Icone nome="microfone" className="h-5 w-5" traco={2} />
    </button>
  );
}
