"use client";

import { useEffect, useRef, useState } from "react";

export default function ChatWidget() {
  const [aberto, setAberto] = useState(false);
  const [mensagens, setMensagens] = useState([
    {
      role: "assistant",
      content:
        "Olá! Pode me perguntar sobre atas, itens/saldo, gerenciamentos, liquidações ou fornecedores.",
    },
  ]);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const fimRef = useRef(null);

  useEffect(() => {
    if (aberto) fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens, aberto]);

  async function enviar(e) {
    e.preventDefault();
    const texto = pergunta.trim();
    if (!texto || carregando) return;

    const novas = [...mensagens, { role: "user", content: texto }];
    setMensagens(novas);
    setPergunta("");
    setCarregando(true);

    try {
      const historico = novas.slice(1, -1).slice(-8).map((m) => ({ role: m.role, content: m.content }));
      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texto, history: historico }),
      });
      const json = await resp.json();
      setMensagens((prev) => [
        ...prev,
        { role: "assistant", content: json.error ? `Erro: ${json.error}` : json.resposta },
      ]);
    } catch (err) {
      setMensagens((prev) => [...prev, { role: "assistant", content: `Erro ao consultar: ${err.message}` }]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <>
      {aberto && (
        <div className="fixed bottom-24 right-4 z-50 flex h-[480px] w-[340px] flex-col rounded-2xl border border-gray-200 bg-white shadow-xl sm:right-6">
          <div className="flex items-center justify-between rounded-t-2xl bg-[#1e3a6e] px-4 py-3 text-white">
            <p className="text-sm font-medium">Consulta Inteligente</p>
            <button onClick={() => setAberto(false)} className="text-white/80 hover:text-white">
              ✕
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {mensagens.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-xs ${
                    m.role === "user" ? "bg-[#1e3a6e] text-white" : "border border-gray-200 bg-gray-50 text-gray-800"
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {carregando && <p className="text-xs text-gray-400">Consultando...</p>}
            <div ref={fimRef} />
          </div>

          <form onSubmit={enviar} className="flex gap-2 border-t border-gray-100 p-3">
            <input
              type="text"
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Pergunte algo..."
              className="flex-1 rounded-full border border-gray-300 px-3 py-1.5 text-xs focus:border-gray-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={carregando}
              className="rounded-full bg-[#1e3a6e] px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Enviar
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setAberto((v) => !v)}
        className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#1e3a6e] text-2xl text-white shadow-lg hover:bg-[#16294f] sm:right-6"
        aria-label="Abrir consulta inteligente"
      >
        {aberto ? "✕" : "💬"}
      </button>
    </>
  );
}
