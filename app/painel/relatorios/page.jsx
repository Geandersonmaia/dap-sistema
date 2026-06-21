"use client";
export const dynamic = "force-dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DataTable from "@/components/dashboard/DataTable";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import RefreshButton from "@/components/dashboard/RefreshButton";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { formatarMoeda, formatarData, formatarPercentual } from "@/lib/notion/normalizers";

function Secao({ titulo, total, children, aberta, onToggle }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-700">
          {titulo} <span className="font-normal text-gray-400">({total})</span>
        </span>
        <span className="text-gray-400">{aberta ? "▲" : "▼"}</span>
      </button>
      {aberta && <div className="border-t border-gray-100 p-4">{children}</div>}
    </div>
  );
}

export default function RelatoriosPage() {
  const [liquidacoes, setLiquidacoes] = useState(null);
  const [atas, setAtas] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [secaoAberta, setSecaoAberta] = useState("liquidadasVencidas");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      const [respLiq, respAtas] = await Promise.all([fetch("/api/bi/liquidacoes"), fetch("/api/bi/atas")]);
      const jsonLiq = await respLiq.json();
      const jsonAtas = await respAtas.json();
      if (jsonLiq.error) throw new Error(jsonLiq.error);
      if (jsonAtas.error) throw new Error(jsonAtas.error);
      setLiquidacoes(jsonLiq);
      setAtas(jsonAtas);
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

  const relatorios = useMemo(() => {
    if (!liquidacoes || !atas) return null;
    const l = liquidacoes.liquidacoes;
    const a = atas.atas;

    return {
      liquidacoesVencidas: l.filter((x) => typeof x.prazoStatus === "string" && x.prazoStatus.includes("Vencido")),
      liquidacoesVencendo: l.filter(
        (x) => typeof x.prazoStatus === "string" && x.prazoStatus.includes("Vence em Breve")
      ),
      atasSaldoBaixo: a.filter((x) => x.statusPainel === "🟡 Saldo Baixo"),
      atasReimplantacao: a.filter((x) => x.statusPainel === "🟠 Em Reimplantação"),
      pendentesAtesto: l.filter((x) => x.status === "Aguardando Atesto"),
      pendentesRecebimentoDefinitivo: l.filter((x) => x.status === "Recebimento Definitivo"),
      encaminhadosPagamento: l.filter((x) => x.status === "Encaminhado para Pagamento"),
    };
  }, [liquidacoes, atas]);

  function alternar(nome) {
    setSecaoAberta((s) => (s === nome ? null : nome));
  }

  const colunasLiquidacao = [
    { key: "fornecedor", label: "Fornecedor" },
    { key: "processoSEI", label: "Processo SEI" },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: (l) => <StatusBadge texto={l.status} />,
      csvValue: (l) => l.status || "",
    },
    { key: "diasRestantes", label: "Dias Restantes" },
  ];

  const colunasAta = [
    { key: "ata", label: "Nº da Ata" },
    { key: "objeto", label: "Objeto" },
    { key: "percentualConsumido", label: "% Consumido", render: (a) => formatarPercentual(a.percentualConsumido) },
    {
      key: "vigenciaFinal",
      label: "Vigência Final",
      render: (a) => formatarData(a.vigenciaFinal),
      csvValue: (a) => formatarData(a.vigenciaFinal),
    },
  ];

  return (
    <DashboardLayout titulo="Relatórios">
      <div className="mb-4 flex justify-end">
        <RefreshButton onClick={carregar} atualizadoEm={liquidacoes?.atualizadoEm} carregando={carregando} />
      </div>

      {carregando && !relatorios && <LoadingState texto="Carregando relatórios..." />}
      {erro && <ErrorState mensagem={erro} onRetry={carregar} />}

      {relatorios && !erro && (
        <div className="space-y-3">
          <Secao
            titulo="Liquidações Vencidas"
            total={relatorios.liquidacoesVencidas.length}
            aberta={secaoAberta === "liquidacoesVencidas"}
            onToggle={() => alternar("liquidacoesVencidas")}
          >
            <DataTable exportFilename="liquidacoes-vencidas" data={relatorios.liquidacoesVencidas} columns={colunasLiquidacao} />
          </Secao>

          <Secao
            titulo="Liquidações Vencendo em Breve"
            total={relatorios.liquidacoesVencendo.length}
            aberta={secaoAberta === "liquidacoesVencendo"}
            onToggle={() => alternar("liquidacoesVencendo")}
          >
            <DataTable exportFilename="liquidacoes-vencendo" data={relatorios.liquidacoesVencendo} columns={colunasLiquidacao} />
          </Secao>

          <Secao
            titulo="Atas com Saldo Baixo"
            total={relatorios.atasSaldoBaixo.length}
            aberta={secaoAberta === "atasSaldoBaixo"}
            onToggle={() => alternar("atasSaldoBaixo")}
          >
            <DataTable exportFilename="atas-saldo-baixo" data={relatorios.atasSaldoBaixo} columns={colunasAta} />
          </Secao>

          <Secao
            titulo="Atas em Reimplantação Urgente"
            total={relatorios.atasReimplantacao.length}
            aberta={secaoAberta === "atasReimplantacao"}
            onToggle={() => alternar("atasReimplantacao")}
          >
            <DataTable exportFilename="atas-reimplantacao" data={relatorios.atasReimplantacao} columns={colunasAta} />
          </Secao>

          <Secao
            titulo="Pendentes de Atesto"
            total={relatorios.pendentesAtesto.length}
            aberta={secaoAberta === "pendentesAtesto"}
            onToggle={() => alternar("pendentesAtesto")}
          >
            <DataTable exportFilename="pendentes-atesto" data={relatorios.pendentesAtesto} columns={colunasLiquidacao} />
          </Secao>

          <Secao
            titulo="Pendentes de Recebimento Definitivo"
            total={relatorios.pendentesRecebimentoDefinitivo.length}
            aberta={secaoAberta === "pendentesRecebimentoDefinitivo"}
            onToggle={() => alternar("pendentesRecebimentoDefinitivo")}
          >
            <DataTable
              exportFilename="pendentes-recebimento-definitivo"
              data={relatorios.pendentesRecebimentoDefinitivo}
              columns={colunasLiquidacao}
            />
          </Secao>

          <Secao
            titulo="Já Encaminhados para Pagamento"
            total={relatorios.encaminhadosPagamento.length}
            aberta={secaoAberta === "encaminhadosPagamento"}
            onToggle={() => alternar("encaminhadosPagamento")}
          >
            <DataTable
              exportFilename="encaminhados-pagamento"
              data={relatorios.encaminhadosPagamento}
              columns={colunasLiquidacao}
            />
          </Secao>
        </div>
      )}
    </DashboardLayout>
  );
}
