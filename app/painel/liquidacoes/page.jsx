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
import { formatarMoeda, formatarData } from "@/lib/notion/normalizers";

const OPCOES_STATUS = [
  "Todos",
  "Aguardando Entrega",
  "Recebimento Provisório",
  "Recebimento Definitivo",
  "Aguardando NF",
  "Aguardando Atesto",
  "Liquidado",
  "Encaminhado para Pagamento",
];

export default function LiquidacoesPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState({ status: "Todos" });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resp = await fetch("/api/bi/liquidacoes");
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

  const filtrados = useMemo(() => {
    if (!dados?.liquidacoes) return [];
    return dados.liquidacoes.filter((l) => {
      if (filtros.status !== "Todos" && l.status !== filtros.status) return false;
      if (busca) {
        const t = busca.toLowerCase();
        const campos = [l.fornecedor, l.processoSEI, l.ne, l.notaFiscal, l.cnpj];
        if (!campos.some((c) => c && c.toLowerCase().includes(t))) return false;
      }
      return true;
    });
  }, [dados, busca, filtros]);

  function linhaClasse(l) {
    if (typeof l.prazoStatus === "string" && l.prazoStatus.includes("Vencido")) return "bg-red-50";
    if (l.diasRestantes != null && l.diasRestantes <= 5 && l.diasRestantes >= 0) return "bg-amber-50";
    return "";
  }

  return (
    <DashboardLayout titulo="Liquidação">
      <div className="mb-4 flex justify-end">
        <RefreshButton onClick={carregar} atualizadoEm={dados?.atualizadoEm} carregando={carregando} />
      </div>

      {carregando && !dados && <LoadingState texto="Carregando liquidações..." />}
      {erro && <ErrorState mensagem={erro} onRetry={carregar} />}

      {dados && !erro && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            <StatCard titulo="Total" valor={dados.resumo.totalLiquidacoes} />
            <StatCard titulo="Vencidas" valor={dados.resumo.vencidasLiquidacao} cor="vermelho" />
            <StatCard titulo="Vencendo em Breve" valor={dados.resumo.vencendoEmBreve} cor="amarelo" />
            <StatCard titulo="Pend. Recebimento" valor={dados.resumo.pendentesRecebimento} cor="azul" />
            <StatCard titulo="Pend. Atesto" valor={dados.resumo.pendentesAtesto} cor="azul" />
            <StatCard
              titulo="Valor Pendente"
              valor={formatarMoeda(dados.resumo.valorTotalPendente)}
              subtitulo={dados.resumo.valorTotalPendente ? "" : "Campo 'Valor' ainda não cadastrado no Notion"}
            />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por fornecedor, processo, NE ou NF..." />
            <FilterBar
              filtros={[{ key: "status", label: "Status", options: OPCOES_STATUS }]}
              valores={filtros}
              onChange={(k, v) => setFiltros((f) => ({ ...f, [k]: v }))}
            />
          </div>

          <DataTable
            exportFilename="liquidacoes"
            data={filtrados}
            linhaClasse={linhaClasse}
            columns={[
              { key: "fornecedor", label: "Fornecedor" },
              { key: "cnpj", label: "CNPJ", render: (l) => l.cnpj || "—" },
              { key: "processoSEI", label: "Processo SEI" },
              { key: "ne", label: "NE" },
              { key: "notaFiscal", label: "Nota Fiscal", render: (l) => l.notaFiscal || "—" },
              {
                key: "valor",
                label: "Valor",
                render: (l) => formatarMoeda(l.valor),
                csvValue: (l) => l.valor ?? "",
              },
              {
                key: "dataEnvioNE",
                label: "Envio do Empenho",
                render: (l) => formatarData(l.dataEnvioNE),
                csvValue: (l) => formatarData(l.dataEnvioNE),
              },
              {
                key: "diasRestantes",
                label: "Dias Restantes",
                render: (l) => (l.diasRestantes != null ? l.diasRestantes : "—"),
              },
              {
                key: "status",
                label: "Status",
                sortable: false,
                render: (l) => <StatusBadge texto={l.status} />,
                csvValue: (l) => l.status || "",
              },
              { key: "notificacoes", label: "Notificações", render: (l) => l.notificacoes ?? 0 },
            ]}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
