"use client";
export const dynamic = "force-dynamic";
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
  "Recebido",
  "Em Elaboração",
  "Análise NUGERP",
  "Análise de Fornecedor",
  "Análise Orçamentária",
  "Encaminhado para Empenho",
  "Empenhado",
  "Encaminhado para Pagamento",
];

export default function GerenciamentosPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState({ status: "Todos" });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resp = await fetch("/api/bi/gerenciamentos");
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
    if (!dados?.gerenciamentos) return [];
    return dados.gerenciamentos.filter((g) => {
      if (filtros.status !== "Todos" && g.status !== filtros.status) return false;
      if (busca && !g.objeto.toLowerCase().includes(busca.toLowerCase())) return false;
      return true;
    });
  }, [dados, busca, filtros]);

  return (
    <DashboardLayout titulo="Gerenciamentos">
      <div className="mb-4 flex justify-end">
        <RefreshButton onClick={carregar} atualizadoEm={dados?.atualizadoEm} carregando={carregando} />
      </div>

      {carregando && !dados && <LoadingState texto="Carregando gerenciamentos..." />}
      {erro && <ErrorState mensagem={erro} onRetry={carregar} />}

      {dados && !erro && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard titulo="Total" valor={dados.resumo.totalGerenciamentos} />
            <StatCard titulo="Ativos" valor={dados.resumo.ativosGerenciamento} cor="azul" />
            <StatCard titulo="Atrasados" valor={dados.resumo.atrasadosGerenciamento} cor="vermelho" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por objeto..." />
            <FilterBar
              filtros={[{ key: "status", label: "Status", options: OPCOES_STATUS }]}
              valores={filtros}
              onChange={(k, v) => setFiltros((f) => ({ ...f, [k]: v }))}
            />
          </div>

          <DataTable
            exportFilename="gerenciamentos"
            data={filtrados}
            columns={[
              { key: "objeto", label: "Objeto" },
              { key: "ata", label: "Ata Vinculada" },
              { key: "demandante", label: "Demandante", render: (l) => l.demandante || "—" },
              { key: "processo", label: "Processo SEI" },
              {
                key: "valorEstimado",
                label: "Valor Estimado",
                render: (l) => formatarMoeda(l.valorEstimado),
                csvValue: (l) => l.valorEstimado ?? "",
              },
              {
                key: "status",
                label: "Status",
                sortable: false,
                render: (l) => <StatusBadge texto={l.status} />,
                csvValue: (l) => l.status || "",
              },
              {
                key: "dataSolicitacao",
                label: "Data de Criação",
                render: (l) => formatarData(l.dataSolicitacao),
                csvValue: (l) => formatarData(l.dataSolicitacao),
              },
              {
                key: "prazoInterno",
                label: "Prazo Interno",
                render: (l) => formatarData(l.prazoInterno),
                csvValue: (l) => formatarData(l.prazoInterno),
              },
            ]}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
