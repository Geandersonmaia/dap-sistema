"use client";
export const dynamic = "force-dynamic";
import { useCallback, useEffect, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DataTable from "@/components/dashboard/DataTable";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import RefreshButton from "@/components/dashboard/RefreshButton";
import SearchInput from "@/components/dashboard/SearchInput";
import { formatarMoeda, formatarData } from "@/lib/notion/normalizers";

export default function FornecedoresPage() {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const resp = await fetch("/api/bi/fornecedores");
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

  const filtrados = dados?.fornecedores?.filter((f) =>
    busca ? f.fornecedor.toLowerCase().includes(busca.toLowerCase()) : true
  );

  return (
    <DashboardLayout titulo="Fornecedores">
      <div className="mb-4 flex justify-end">
        <RefreshButton onClick={carregar} atualizadoEm={dados?.atualizadoEm} carregando={carregando} />
      </div>

      {carregando && !dados && <LoadingState texto="Carregando fornecedores..." />}
      {erro && <ErrorState mensagem={erro} onRetry={carregar} />}

      {dados && !erro && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-medium text-gray-700">Mais Pendências</p>
              <ol className="space-y-1 text-sm text-gray-600">
                {dados.rankings.maisPendencias.map((f, i) => (
                  <li key={f.fornecedor} className="flex justify-between">
                    <span>{i + 1}. {f.fornecedor}</span>
                    <b>{f.quantidadePendencias}</b>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-medium text-gray-700">Mais Vencidos</p>
              <ol className="space-y-1 text-sm text-gray-600">
                {dados.rankings.maisVencidos.map((f, i) => (
                  <li key={f.fornecedor} className="flex justify-between">
                    <span>{i + 1}. {f.fornecedor}</span>
                    <b>{f.quantidadeVencidos}</b>
                  </li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
              <p className="mb-2 text-sm font-medium text-gray-700">Maior Valor Pendente</p>
              <ol className="space-y-1 text-sm text-gray-600">
                {dados.rankings.maiorValorPendente.map((f, i) => (
                  <li key={f.fornecedor} className="flex justify-between">
                    <span>{i + 1}. {f.fornecedor}</span>
                    <b>{formatarMoeda(f.valorTotal)}</b>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <SearchInput value={busca} onChange={setBusca} placeholder="Buscar fornecedor..." />

          <DataTable
            exportFilename="fornecedores"
            data={filtrados}
            columns={[
              { key: "fornecedor", label: "Fornecedor" },
              { key: "cnpj", label: "CNPJ", render: (f) => f.cnpj || "—" },
              { key: "quantidadeProcessos", label: "Processos" },
              { key: "quantidadePendencias", label: "Pendências" },
              { key: "quantidadeVencidos", label: "Vencidos" },
              {
                key: "valorTotal",
                label: "Valor Total",
                render: (f) => formatarMoeda(f.valorTotal),
                csvValue: (f) => f.valorTotal ?? "",
              },
              {
                key: "ultimaMovimentacao",
                label: "Última Movimentação",
                render: (f) => formatarData(f.ultimaMovimentacao),
                csvValue: (f) => formatarData(f.ultimaMovimentacao),
              },
            ]}
          />
        </div>
      )}
    </DashboardLayout>
  );
}
