"use client";

import Link from "next/link";
import ObrasLayout from "@/components/obras/ObrasLayout";
import Lucrometro from "@/components/obras/Lucrometro";
import Alertas from "@/components/obras/Alertas";
import TabelaInsumos from "@/components/obras/TabelaInsumos";
import { GraficoAcumulado, GraficoCategorias, GraficoResultadoMensal, GraficoVariacaoPrecos } from "@/components/obras/Graficos";
import Kpi from "@/components/obras/Kpi";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import RefreshButton from "@/components/dashboard/RefreshButton";
import { botaoPrimario, botaoSecundario } from "@/components/obras/Campo";
import { useObra } from "@/hooks/useObra";
import { formatarBRL, formatarPct } from "@/lib/obras/calculos";

function PrimeirosPassos({ id, dados }) {
  const passos = [
    { feito: dados.itens.length > 0, texto: "Cadastrar o orçamento contratado (planilha de insumos)", href: `/obras/${id}/orcamento` },
    { feito: dados.medicoes.length > 0, texto: "Lançar as medições já aprovadas pelo órgão", href: `/obras/${id}/medicoes` },
    { feito: dados.lancamentos.length > 0, texto: "Lançar os gastos (notas fiscais, folha, aluguel de equipamentos)", href: `/obras/${id}/lancamentos` },
  ];
  if (passos.every((p) => p.feito)) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-800">Para o lucrômetro funcionar:</p>
      <ol className="mt-2 space-y-1.5 text-sm">
        {passos.map((p, i) => (
          <li key={i} className="flex items-center gap-2">
            <span>{p.feito ? "✅" : "⬜"}</span>
            <Link href={p.href} className={p.feito ? "text-gray-400 line-through" : "text-slate-800 underline"}>
              {p.texto}
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function PainelObraPage({ params }) {
  const { dados, erro, carregando, recarregar } = useObra(params.id);
  const a = dados?.analise;

  return (
    <ObrasLayout
      titulo={dados?.obra?.nome || "Obra"}
      obraId={params.id}
      nomeObra={dados?.obra?.nome}
      acoes={
        dados && (
          <>
            <RefreshButton onClick={recarregar} atualizadoEm={dados.atualizadoEm} carregando={carregando} />
            <Link href={`/obras/${params.id}/lancamentos`} className={botaoPrimario}>
              + Lançar gasto
            </Link>
            <Link href={`/obras/${params.id}/relatorio`} className={botaoSecundario}>
              ⚖️ Relatório
            </Link>
          </>
        )
      }
    >
      {carregando && !dados && <LoadingState texto="Calculando..." />}
      {erro && <ErrorState mensagem={erro} onRetry={recarregar} />}

      {a && (
        <div className="space-y-6">
          <PrimeirosPassos id={params.id} dados={dados} />

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Lucrometro
              titulo="Lucrômetro — até agora"
              margem={a.margem}
              margemOrcada={a.margemOrcada}
              situacao={a.situacao}
              resultado={a.resultado}
            />
            <Lucrometro
              titulo="Lucrômetro — fim da obra, com os preços de hoje"
              margem={a.execucao > 0 ? a.margemProjetada : null}
              margemOrcada={a.margemOrcada}
              situacao={a.execucao > 0 ? a.situacaoProjetada : "sem_dados"}
              resultado={a.execucao > 0 ? a.resultadoProjetado : undefined}
            />
            <div className="flex flex-col justify-between gap-4 rounded-xl border border-red-200 bg-red-50/60 p-5 shadow-sm">
              <div>
                <p className="text-sm font-medium text-gray-700">⚖️ Reequilíbrio estimado</p>
                <p className="mt-2 text-3xl font-bold tabular-nums text-red-700">{formatarBRL(Math.max(0, a.reequilibrioEstimado))}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Alta dos insumos acima do orçado{a.reajuste > 0 ? " e do reajuste" : ""}, sobre as quantidades do contrato, + BDI.
                </p>
              </div>
              {a.execucao > 0 && a.reequilibrioEstimado > 0 && (
                <div className="rounded-lg bg-white p-3 text-sm">
                  <p className="text-xs text-gray-500">Margem final se for concedido</p>
                  <p className="text-lg font-semibold tabular-nums text-gray-900">
                    {formatarPct(a.margemProjetada)} → {formatarPct(a.margemComReequilibrio)}
                  </p>
                </div>
              )}
              <Link href={`/obras/${params.id}/relatorio`} className={`${botaoPrimario} text-center`}>
                Gerar relatório para o órgão
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Kpi titulo="Valor do contrato" valor={formatarBRL(a.valorContrato)} />
            <Kpi titulo="Executado (medido)" valor={formatarPct(a.execucao)} cor="azul" />
            <Kpi titulo="Receita medida" valor={formatarBRL(a.receitaMedida)} cor="azul" subtitulo={`Recebido: ${formatarBRL(a.receitaRecebida)}`} />
            <Kpi titulo="Custo real" valor={formatarBRL(a.custoReal)} subtitulo={`Previsto p/ o medido: ${formatarBRL(a.custoOrcadoProporcional)}`} />
            <Kpi
              titulo="Estouro de custo"
              valor={formatarBRL(a.desvioCusto)}
              cor={a.desvioCusto > 0 ? "vermelho" : "verde"}
              subtitulo={a.desvioCusto > 0 ? "▲ gastou mais que o orçado" : "▼ dentro do orçado"}
            />
            <Kpi
              titulo="Caixa (recebido − gasto)"
              valor={formatarBRL(a.saldoCaixa)}
              cor={a.saldoCaixa < 0 ? "vermelho" : "verde"}
              subtitulo={a.saldoCaixa < 0 ? "▲ empresa financiando a obra" : undefined}
            />
          </div>

          <Alertas alertas={a.alertas} />

          {a.evolucao.length > 0 && (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <GraficoAcumulado evolucao={a.evolucao} />
              <GraficoResultadoMensal evolucao={a.evolucao} />
              {a.porCategoria.length > 0 && <GraficoCategorias porCategoria={a.porCategoria} />}
              <GraficoVariacaoPrecos itens={a.itens} />
            </div>
          )}

          <div>
            <h2 className="mb-3 text-sm font-semibold text-gray-700">Preço orçado × preço pago (por insumo)</h2>
            <TabelaInsumos itens={a.itens} reajuste={a.reajuste} somenteComCompras />
          </div>
        </div>
      )}
    </ObrasLayout>
  );
}
