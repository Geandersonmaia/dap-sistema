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
import { formatarData } from "@/lib/notion/normalizers";

const OPCOES_STATUS = ["Todos", "A fazer", "Em adamento", "Aguardando Terceiros", "Concluido", "Resolver"];
const OPCOES_SITUACAO = [
  "Todas",
  "Lvantamento (DFD)",
  "TR",
  "Pesquisa de Preço",
  "Análise Técnica",
  "Liciticação",
  "Ata assinada",
  "Homologação",
];

export default function ImplantacoesPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [filtros, setFiltros] = useState({ status: "Todos", situacao: "Todas" });

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resp = await fetch("/api/bi/implantacoes");
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
    if (!dados?.implantacoes) return [];
    return dados.implantacoes.filter((i) => {
      if (filtros.status !== "Todos" && i.status !== filtros.status) return false;
      if (filtros.situacao !== "Todas" && i.situacaoImplantacao !== filtros.situacao) return false;
      if (busca) {
        const t = busca.toLowerCase();
        const campos = [i.objeto, i.processoSEI, i.departamentoDemandante];
        if (!campos.some((c) => c && c.toLowerCase().includes(t))) return false;
      }
      return true;
    });
  }, [dados, busca, filtros]);

  function linhaClasse(i) {
    if (i.status !== "Concluido" && i.prioridade === "Urgente") return "bg-red-50";
    if (i.status !== "Concluido" && i.prioridade === "Alta") return "bg-amber-50";
    return "";
  }

  return (
    <DashboardLayout titulo="Implantações">
      <div className="mb-4 flex justify-end">
        <RefreshButton onClick={carregar} atualizadoEm={dados?.atualizadoEm} carregando={carregando} />
      </div>

      {carregando && !dados && <LoadingState texto="Carregando implantações..." />}
      {erro && <ErrorState mensagem={erro} onRetry={carregar} />}

      {dados && !erro && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <StatCard titulo="Total de Implantações" valor={dados.resumo.totalImplantacoes} />
            <StatCard titulo="Em Andamento" valor={dados.resumo.implantacoesAndamento} cor="azul" />
            <StatCard titulo="Urgentes" valor={dados.resumo.implantacoesUrgentes} cor="vermelho" />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <SearchInput value={busca} onChange={setBusca} placeholder="Buscar por objeto, processo ou departamento..." />
            <FilterBar
              filtros={[
                { key: "status", label: "Status", options: OPCOES_STATUS },
                { key: "situacao", label: "Situação", options: OPCOES_SITUACAO },
              ]}
              valores={filtros}
              onChange={(k, v) => setFiltros((f) => ({ ...f, [k]: v }))}
            />
          </div>

          <DataTable
            exportFilename="implantacoes"
            data={filtrados}
            linhaClasse={linhaClasse}
            columns={[
              { key: "objeto", label: "Objeto" },
              { key: "processoSEI", label: "Processo SEI", render: (i) => i.processoSEI || "—" },
              { key: "departamentoDemandante", label: "Departamento", render: (i) => i.departamentoDemandante || "—" },
              { key: "prioridade", label: "Prioridade", render: (i) => i.prioridade || "—" },
              {
                key: "situacaoImplantacao",
                label: "Situação",
                sortable: false,
                render: (i) => <StatusBadge texto={i.situacaoImplantacao} />,
                csvValue: (i) => i.situacaoImplantacao || "",
              },
              {
                key: "status",
                label: "Status",
                sortable: false,
                render: (i) => <StatusBadge texto={i.status} />,
                csvValue: (i) => i.status || "",
              },
              {
                key: "previsaoConclusao",
                label: "Previsão Conclusão",
                render: (i) => formatarData(i.previsaoConclusao),
                csvValue: (i) => formatarData(i.previsaoConclusao),
              },
            ]}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
