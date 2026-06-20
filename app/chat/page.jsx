"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function ChatPage() {
  const [mensagens, setMensagens] = useState([
    {
      role: "assistant",
      content:
        "Olá! Pode me perguntar sobre atas vigentes, saldo de itens, gerenciamentos, liquidações ou implantações. Ex: \"quais atas vencem nos próximos 30 dias?\" ou \"qual o saldo do item luva de procedimento?\"",
    },
  ]);
  const [pergunta, setPergunta] = useState("");
  const [carregando, setCarregando] = useState(false);
  const fimRef = useRef(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(e) {
    e.preventDefault();
    const texto = pergunta.trim();
    if (!texto || carregando) return;

    const novasMensagens = [...mensagens, { role: "user", content: texto }];
    setMensagens(novasMensagens);
    setPergunta("");
    setCarregando(true);

    try {
      // Manda só os últimos pares de mensagens como histórico, pra não pesar o contexto
      const historico = novasMensagens
        .slice(1, -1) // remove a mensagem de boas-vindas e a pergunta atual (vai separada)
        .slice(-8)
        .map((m) => ({ role: m.role, content: m.content }));

      const resp = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: texto, history: historico }),
      });
      const json = await resp.json();

      if (json.error) {
        setMensagens((prev) => [...prev, { role: "assistant", content: `Erro: ${json.error}` }]);
      } else {
        setMensagens((prev) => [...prev, { role: "assistant", content: json.resposta }]);
      }
    } catch (err) {
      setMensagens((prev) => [...prev, { role: "assistant", content: `Erro ao consultar: ${err.message}` }]);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-gray-900">Consulta Inteligente — DAP</h1>
        <Link href="/painel" className="text-sm text-gray-500 hover:text-gray-900">
          Ir para o Painel →
        </Link>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-2xl space-y-4">
          {mensagens.map((m, i) => (
            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm ${
                  m.role === "user" ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-800"
                }`}
              >
                {m.content}
              </div>
            </div>
          ))}
          {carregando && (
            <div className="flex justify-start">
              <div className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-400">
                Consultando as bases...
              </div>
            </div>
          )}
          <div ref={fimRef} />
        </div>
      </div>

      <form onSubmit={enviar} className="border-t border-gray-200 bg-white p-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <input
            type="text"
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            placeholder="Pergunte sobre atas, itens, gerenciamentos, liquidações..."
            className="flex-1 rounded-full border border-gray-300 px-4 py-2.5 text-sm focus:border-gray-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={carregando}
            className="rounded-full bg-gray-900 px-5 py-2.5 text-sm text-white disabled:opacity-50"
          >
            Enviar
          </button>
        </div>
      </form>
    </div>
  );
}
