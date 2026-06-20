"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const URGENCIA_STYLE = {
  1: { label: "Crítico", bg: "bg-red-50", border: "border-red-300", text: "text-red-700", dot: "bg-red-500" },
  2: { label: "Alto", bg: "bg-orange-50", border: "border-orange-300", text: "text-orange-700", dot: "bg-orange-500" },
  3: { label: "Médio", bg: "bg-yellow-50", border: "border-yellow-300", text: "text-yellow-700", dot: "bg-yellow-500" },
};

const SITUACAO_COR = {
  "🟢": "border-green-300 bg-green-50 text-green-700",
  "🟡": "border-yellow-300 bg-yellow-50 text-yellow-700",
  "🟠": "border-orange-300 bg-orange-50 text-orange-700",
  "🔴": "border-red-300 bg-red-50 text-red-700",
};

function corSituacao(texto) {
  if (!texto) return "border-gray-300 bg-gray-50 text-gray-700";
  const emoji = texto.trim().slice(0, 2).trim();
  return SITUACAO_COR[emoji] || "border-gray-300 bg-gray-50 text-gray-700";
}

function KpiCard({ titulo, valor, subtitulo }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{titulo}</p>
      <p className="mt-1 text-3xl font-semibold text-gray-900">{valor}</p>
      {subtitulo && <p className="mt-1 text-xs text-gray-400">{subtitulo}</p>}
    </div>
  );
}

function AlertaItem({ alerta }) {
  const estilo = URGENCIA_STYLE[alerta.urgencia] || URGENCIA_STYLE[3];
  return (
    <div className={`flex items-start gap-3 rounded-lg border ${estilo.border} ${estilo.bg} p-4`}>
      <span className={`mt-1 h-2.5 w-2.5 flex-shrink-0 rounded-full ${estilo.dot}`} />
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium text-gray-900">{alerta.titulo}</p>
          <span className={`whitespace-nowrap text-xs font-semibold uppercase ${estilo.text}`}>
            {estilo.label}
          </span>
        </div>
        <p className="text-sm text-gray-600">{alerta.detalhe}</p>
        <p className="mt-1 text-xs text-gray-400">
          {alerta.tipo} · {alerta.origem}
        </p>
      </div>
    </div>
  );
}

function ConsultaItem() {
  const [busca, setBusca] = useState("");
  const [resultado, setResultado] = useState(null);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (busca.trim().length < 2) {
      setResultado(null);
      return;
    }
    setBuscando(true);
    const timer = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/itens?busca=${encodeURIComponent(busca)}`);
        const json = await resp.json();
        setResultado(json);
      } catch {
        setResultado({ itens: [], error: "Erro ao buscar" });
      } finally {
        setBuscando(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [busca]);

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-lg font-semibold text-gray-900">Consultar Item / Saldo</h2>
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Digite o nome ou código do item (ex: luva, pulseira, código...)"
        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm shadow-sm focus:border-gray-400 focus:outline-none"
      />

      {buscando && <p className="mt-2 text-xs text-gray-400">Buscando...</p>}

      {resultado && !buscando && (
        <div className="mt-3 space-y-2">
          {resultado.itens?.length === 0 && (
            <p className="text-sm text-gray-500">Nenhum item encontrado.</p>
          )}
          {resultado.itens?.map((it, i) => (
            <div key={i} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-gray-900">{it.item}</p>
                <span
                  className={`whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium ${corSituacao(
                    it.situacaoPorSaldo
                  )}`}
                >
                  {it.situacaoPorSaldo || "—"}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                {it.codigo && `Código: ${it.codigo} · `}
                Ata(s): {it.atas?.join(", ") || "—"}
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600 sm:grid-cols-4">
                <span>Registrado: <b>{it.quantidadeRegistrada ?? "—"}</b></span>
                <span>Gerenciado: <b>{it.quantidadeGerenciada ?? "—"}</b></span>
                <span>Saldo: <b>{it.saldoQuantidade ?? "—"}</b> {it.unidade}</span>
                <span>Consumido: <b>{it.percentualConsumido != null ? `${it.percentualConsumido}%` : "—"}</b></span>
              </div>
            </div>
          ))}
          {resultado.totalEncontrado > 20 && (
            <p className="text-xs text-gray-400">
              Mostrando 20 de {resultado.totalEncontrado} resultados — refine a busca.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function PainelPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  async function carregar() {
    try {
      const resp = await fetch("/api/painel");
      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      setDados(json);
      setErro(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
    const interval = setInterval(carregar, 2 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (carregando) {
    return <div className="p-8 text-gray-500">Carregando painel...</div>;
  }

  if (erro) {
    return (
      <div className="p-8">
        <p className="font-medium text-red-600">Erro ao carregar o painel: {erro}</p>
        <button onClick={carregar} className="mt-3 rounded-md bg-gray-900 px-4 py-2 text-sm text-white">
          Tentar novamente
        </button>
      </div>
    );
  }

  const { kpis, alertas, atualizadoEm } = dados;

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Painel de Controle — DAP</h1>
          <div className="flex items-center gap-4">
            <p className="text-xs text-gray-400">
              Atualizado em {new Date(atualizadoEm).toLocaleString("pt-BR")}
            </p>
            <Link href="/chat" className="text-sm text-gray-500 hover:text-gray-900">
              Consulta Inteligente →
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <KpiCard
            titulo="Atas Vigentes"
            valor={kpis.atasVigentes.total}
            subtitulo={`🟢 ${kpis.atasVigentes.porStatus["🟢 Ativa"]} · 🟡 ${kpis.atasVigentes.porStatus["🟡 Saldo Baixo"]} · 🟠 ${kpis.atasVigentes.porStatus["🟠 Em Reimplantação"]} · 🔴 ${kpis.atasVigentes.porStatus["🔴 Encerrada"]}`}
          />
          <KpiCard titulo="Gerenciamentos Ativos" valor={kpis.gerenciamentosAtivos} />
          <KpiCard titulo="Liquidações Pendentes" valor={kpis.liquidacoesPendentes} />
          <KpiCard titulo="Implantações em Andamento" valor={kpis.implantacoesAndamento} />
        </div>

        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold text-gray-900">
            Alertas do dia <span className="text-sm font-normal text-gray-400">({alertas.length})</span>
          </h2>
          {alertas.length === 0 ? (
            <p className="text-sm text-gray-500">Nenhum alerta no momento. Tudo sob controle.</p>
          ) : (
            <div className="space-y-2">
              {alertas.map((a, i) => (
                <AlertaItem key={i} alerta={a} />
              ))}
            </div>
          )}
        </div>

        <ConsultaItem />
      </div>
    </div>
  );
}
