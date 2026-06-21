"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import StatCard from "@/components/dashboard/StatCard";
import DataTable from "@/components/dashboard/DataTable";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import RefreshButton from "@/components/dashboard/RefreshButton";
import SearchInput from "@/components/dashboard/SearchInput";
import FilterBar from "@/components/dashboard/FilterBar";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { formatarMoeda, formatarData, formatarPercentual } from "@/lib/notion/normalizers";

const OPCOES_STATUS = ["Todos", "🟢 Ativa", "🟡 Saldo Baixo", "🟠 Em Reimplantação", "🔴 Encerrada"];

export default function AtasPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState({ status: "Todos" });

  const [buscaItem, setBuscaItem] = useState("");
  const [resultadoItem, setResultadoItem] = useState(null);
  const [buscandoItem, setBuscandoItem] = useState(false);

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resp = await fetch("/api/bi/atas");
      const json = await resp.json();
      if (json.error) throw new Error(json.error);
      setDados(json);
      setErro(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  useEffect(() => {
    if (buscaItem.trim().length < 2) {
      setResultadoItem(null);
      return;
    }
    setBuscandoItem(true);
    const timer = setTimeout(async () => {
      try {
        const resp = await fetch(`/api/bi/itens?busca=${encodeURIComponent(buscaItem)}`);
        const json = await resp.json();
        setResultadoItem(json);
      } finally {
        setBuscandoItem(false);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [buscaItem]);

  const atasFiltradas = useMemo(() => {
    if (!dados?.atas) return [];
    return dados.atas.filter((a) => {
      if (filtros.status !== "Todos" && a.statusPainel !== filtros.status) return false;
      if (busca) {
        const t = busca.toLowerCase();
        if (!a.ata.toLowerCase().includes(t) && !a.objeto.toLowerCase().includes(t)) return false;
      }
      return true;
    });
  }, [dados, busca, filtros]);

  return (
    <DashboardLayout titulo="Atas">
      <div className="mb-4 flex justify-end">
        <RefreshButton onClick={carregar} atualizadoEm={dados?.atualizadoEm} carregando={carregando} />
      </div>

      {carregando && !dados && <LoadingState texto="Carregando atas..." />}
      {erro && <ErrorState mensagem={erro} onRetry={carregar} />}

      {dados && !erro && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard titulo="Total de Atas" valor={dados.resumo.totalAtas} />
            <StatCard titulo="Ativas" valor={dados.resumo.ativas} cor="verde" />
            <StatCard titulo="Vencidas" valor={dados.resumo.vencidas} cor="vermelho" />
            <StatCard titulo="Saldo Baixo" valor={dados.resumo.saldoBaixo} cor="amarelo" />
            <StatCard titulo="Reimplantação Urgente" valor={dados.resumo.reimplantacaoUrgente} cor="amarelo" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por nº da ata ou objeto..." />
            <FilterBar
              filtros={[{ key: "status", label: "Status", options: OPCOES_STATUS }]}
              valores={filtros}
              onChange={(k, v) => setFiltros((f) => ({ ...f, [k]: v }))}
            />
          </div>

          <DataTable
            exportFilename="atas"
            data={atasFiltradas}
            columns={[
              { key: "ata", label: "Nº da Ata" },
              { key: "objeto", label: "Objeto" },
              { key: "processoSEI", label: "Processo SEI" },
              {
                key: "vigenciaFinal",
                label: "Vigência Final",
                render: (l) => formatarData(l.vigenciaFinal),
                csvValue: (l) => formatarData(l.vigenciaFinal),
              },
              {
                key: "valorGlobalHomologado",
                label: "Valor Global Homologado",
                render: (l) => formatarMoeda(l.valorGlobalHomologado),
                csvValue: (l) => l.valorGlobalHomologado ?? "",
              },
              {
                key: "valorTotalGerenciado",
                label: "Valor Total Gerenciado",
                render: (l) => formatarMoeda(l.valorTotalGerenciado),
                csvValue: (l) => l.valorTotalGerenciado ?? "",
              },
              {
                key: "percentualConsumido",
                label: "% Consumido",
                render: (l) => formatarPercentual(l.percentualConsumido),
              },
              {
                key: "saldo",
                label: "Saldo",
                render: (l) => formatarMoeda(l.saldo),
                csvValue: (l) => l.saldo ?? "",
              },
              {
                key: "statusPainel",
                label: "Status",
                sortable: false,
                render: (l) => <StatusBadge texto={l.statusPainel} />,
                csvValue: (l) => l.statusPainel || "",
              },
            ]}
          />

          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Consultar Item / Saldo</h2>
            <SearchInput
              value={buscaItem}
              onChange={setBuscaItem}
              placeholder="Nome ou código do item (ex: luva, pulseira...)"
            />
            {buscandoItem && <p className="mt-2 text-xs text-gray-400">Buscando...</p>}
            {resultadoItem && !buscandoItem && (
              <div className="mt-3 space-y-2">
                {resultadoItem.itens?.length === 0 && (
                  <p className="text-sm text-gray-500">Nenhum item encontrado.</p>
                )}
                {resultadoItem.itens?.map((it) => (
                  <div key={it.id} className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium text-gray-900">{it.item}</p>
                      <StatusBadge texto={it.situacaoPorSaldo} />
                    </div>
                    <p className="text-xs text-gray-400">
                      {it.codigo && `Código: ${it.codigo} · `}
                      Ata(s): {it.atas?.join(", ") || "—"}
                    </p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-sm text-gray-600 sm:grid-cols-4">
                      <span>Registrado: <b>{it.quantidadeRegistrada ?? "—"}</b></span>
                      <span>Gerenciado: <b>{it.quantidadeGerenciada ?? "—"}</b></span>
                      <span>Saldo: <b>{it.saldoQuantidade ?? "—"}</b> {it.unidade}</span>
                      <span>Consumido: <b>{formatarPercentual(it.percentualConsumido)}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
