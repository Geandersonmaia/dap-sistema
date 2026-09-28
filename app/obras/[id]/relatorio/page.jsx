"use client";

import ObrasLayout from "@/components/obras/ObrasLayout";
import TabelaInsumos from "@/components/obras/TabelaInsumos";
import { GraficoAcumulado, GraficoVariacaoPrecos } from "@/components/obras/Graficos";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import { botaoPrimario } from "@/components/obras/Campo";
import { useObra } from "@/hooks/useObra";
import { formatarBRL, formatarData, formatarNumero, formatarPct, labelCategoria } from "@/lib/obras/calculos";

function Secao({ n, titulo, children }) {
  return (
    <section className="break-inside-avoid-page space-y-3">
      <h2 className="border-b border-gray-300 pb-1 text-base font-bold text-gray-900">
        {n}. {titulo}
      </h2>
      {children}
    </section>
  );
}

function Linha({ rotulo, valor, destaque }) {
  return (
    <tr className="border-b border-gray-100 last:border-0">
      <td className="py-1.5 pr-4 text-gray-600">{rotulo}</td>
      <td className={`py-1.5 text-right tabular-nums ${destaque ? "font-bold text-gray-900" : "text-gray-800"}`}>{valor}</td>
    </tr>
  );
}

export default function RelatorioPage({ params }) {
  const { dados, erro, recarregar } = useObra(params.id);
  const o = dados?.obra;
  const a = dados?.analise;
  const comprovantes = (dados?.lancamentos || []).filter((l) => l.item_id).sort((x, y) => (x.data < y.data ? -1 : 1));
  const itensPorId = Object.fromEntries((dados?.itens || []).map((i) => [i.id, i]));
  const hoje = new Date().toLocaleDateString("pt-BR");

  return (
    <ObrasLayout
      titulo="Relatório de reequilíbrio"
      obraId={params.id}
      nomeObra={o?.nome}
      acoes={
        dados && (
          <button onClick={() => window.print()} className={botaoPrimario}>
            🖨️ Imprimir / salvar PDF
          </button>
        )
      }
    >
      {erro && <ErrorState mensagem={erro} onRetry={recarregar} />}
      {!dados && !erro && <LoadingState />}
      {a && (
        <article className="mx-auto max-w-5xl space-y-8 rounded-xl border border-gray-200 bg-white p-6 text-sm leading-relaxed shadow-sm md:p-10 print:max-w-none print:border-0 print:p-0 print:shadow-none">
          <header className="text-center">
            <p className="text-xs uppercase tracking-widest text-gray-500">Demonstrativo técnico-financeiro</p>
            <h1 className="mt-1 text-xl font-bold text-gray-900">Desequilíbrio econômico-financeiro do contrato</h1>
            <p className="mt-1 text-gray-600">
              {o.nome}
              {o.numero_contrato ? ` — Contrato nº ${o.numero_contrato}` : ""}
            </p>
            <p className="text-xs text-gray-400">Posição em {hoje}</p>
          </header>

          <Secao n={1} titulo="Identificação do contrato">
            <table className="w-full">
              <tbody>
                <Linha rotulo="Contratante" valor={o.contratante || "—"} />
                <Linha rotulo="Contrato / processo" valor={`${o.numero_contrato || "—"} / ${o.processo || "—"}`} />
                <Linha rotulo="Objeto" valor={o.objeto || o.nome} />
                <Linha rotulo="Valor contratado" valor={formatarBRL(a.valorContrato)} />
                <Linha rotulo="BDI da proposta" valor={formatarPct(a.bdi, 2)} />
                <Linha rotulo="Data-base do orçamento (proposta)" valor={formatarData(o.data_base)} />
                <Linha rotulo="Início da execução" valor={formatarData(o.data_inicio)} />
                <Linha rotulo="Reajuste contratual já considerado" valor={formatarPct(a.reajuste, 2)} />
              </tbody>
            </table>
          </Secao>

          <Secao n={2} titulo="Situação econômico-financeira atual">
            <table className="w-full">
              <tbody>
                <Linha rotulo="Percentual executado (medido ÷ contratado)" valor={formatarPct(a.execucao)} />
                <Linha rotulo="Receita medida acumulada" valor={formatarBRL(a.receitaMedida)} />
                <Linha rotulo="Custo efetivamente incorrido" valor={formatarBRL(a.custoReal)} />
                <Linha rotulo="Custo previsto no orçamento para o mesmo avanço" valor={formatarBRL(a.custoOrcadoProporcional)} />
                <Linha rotulo="Custo excedente em relação ao orçado" valor={formatarBRL(a.desvioCusto)} destaque />
                <Linha rotulo="Resultado acumulado (receita − custo)" valor={formatarBRL(a.resultado)} destaque />
                <Linha rotulo="Margem realizada" valor={formatarPct(a.margem)} />
                <Linha rotulo="Margem prevista na proposta" valor={formatarPct(a.margemOrcada)} />
                <Linha rotulo="Resultado projetado ao final (saldo a executar aos preços atuais)" valor={formatarBRL(a.resultadoProjetado)} destaque />
              </tbody>
            </table>
            <p className="text-gray-700">
              {a.margem !== null && a.margem < 0
                ? `A execução contratual apresenta prejuízo: para cada R$ 100,00 medidos, a contratada desembolsou R$ ${formatarNumero(100 * (1 - a.margem))}. `
                : a.margem !== null && a.margemOrcada !== null && a.margem < a.margemOrcada
                  ? `A margem realizada (${formatarPct(a.margem)}) está abaixo da margem prevista na proposta (${formatarPct(a.margemOrcada)}), evidenciando a erosão da equação econômico-financeira original. `
                  : ""}
              {a.execucao > 0 && a.resultadoProjetado < 0
                ? `Mantidas as condições atuais, projeta-se prejuízo de ${formatarBRL(-a.resultadoProjetado)} ao final do contrato.`
                : ""}
            </p>
            {a.evolucao.length > 0 && <GraficoAcumulado evolucao={a.evolucao} altura={260} />}
          </Secao>

          <Secao n={3} titulo="Variação dos preços dos insumos (orçado × efetivamente pago)">
            <p className="text-gray-700">
              Comparação entre o preço unitário da planilha orçamentária na data-base
              {a.reajuste > 0 ? `, acrescido do reajuste contratual de ${formatarPct(a.reajuste, 2)},` : ""} e o preço médio
              efetivamente pago, apurado a partir das notas fiscais listadas no Anexo I.
            </p>
            <TabelaInsumos itens={a.itens} reajuste={a.reajuste} somenteComCompras compacta />
            <GraficoVariacaoPrecos itens={a.itens} altura={220} />
          </Secao>

          <Secao n={4} titulo="Custos por categoria">
            <table className="w-full tabular-nums">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs text-gray-500">
                  <th className="py-1.5">Categoria</th>
                  <th className="py-1.5 text-right">Orçado (total)</th>
                  <th className="py-1.5 text-right">Previsto p/ o executado</th>
                  <th className="py-1.5 text-right">Real</th>
                  <th className="py-1.5 text-right">Diferença</th>
                </tr>
              </thead>
              <tbody>
                {a.porCategoria.map((c) => (
                  <tr key={c.categoria} className="border-b border-gray-100">
                    <td className="py-1.5">{c.label}</td>
                    <td className="py-1.5 text-right">{formatarBRL(c.orcado)}</td>
                    <td className="py-1.5 text-right">{formatarBRL(c.orcadoProporcional)}</td>
                    <td className="py-1.5 text-right">{formatarBRL(c.real)}</td>
                    <td className={`py-1.5 text-right font-semibold ${c.desvio > 0 ? "text-red-700" : "text-green-700"}`}>{formatarBRL(c.desvio)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Secao>

          <Secao n={5} titulo="Quantificação do desequilíbrio">
            <table className="w-full">
              <tbody>
                <Linha rotulo="Impacto de preços já suportado (sobre as quantidades adquiridas)" valor={formatarBRL(a.impactoRealizado)} />
                <Linha rotulo="Impacto de preços projetado (sobre as quantidades totais orçadas)" valor={formatarBRL(a.impactoProjetado)} />
                <Linha rotulo={`BDI da proposta (${formatarPct(a.bdi, 2)}) sobre o impacto projetado`} valor={formatarBRL(a.impactoProjetado * a.bdi)} />
                <Linha rotulo="Valor estimado para recomposição do equilíbrio" valor={formatarBRL(Math.max(0, a.reequilibrioEstimado))} destaque />
              </tbody>
            </table>
            <p className="text-xs text-gray-500">
              Metodologia: para cada insumo, (preço médio pago − preço orçado{a.reajuste > 0 ? " reajustado" : ""}) × quantidade.
              Variações negativas (insumos que ficaram mais baratos) são compensadas no total. Excesso de consumo de quantidade não
              compõe o valor, por não decorrer de variação de preço.
            </p>
          </Secao>

          <Secao n={6} titulo="Fundamentação (texto-base para revisão jurídica)">
            <p className="text-gray-700">
              A Constituição Federal (art. 37, XXI) assegura a manutenção das condições efetivas da proposta. A Lei nº 14.133/2021,
              art. 124, II, “d”, admite a alteração do contrato para restabelecer o equilíbrio econômico-financeiro inicial em caso
              de força maior, caso fortuito, fato do príncipe ou fatos imprevisíveis ou previsíveis de consequências incalculáveis
              que inviabilizem a execução tal como pactuada, respeitada a repartição objetiva de risco do contrato. Para contratos
              regidos pela Lei nº 8.666/1993, o fundamento correspondente é o art. 65, II, “d”.
            </p>
            <p className="text-gray-700">
              Os dados acima demonstram que a elevação dos custos dos insumos, em patamar superior ao reajuste contratual, alterou a
              relação entre encargos e remuneração estabelecida na proposta.
            </p>
            <p className="rounded bg-amber-50 px-3 py-2 text-xs text-amber-900 print:bg-transparent print:px-0">
              ⚠️ Texto de referência gerado automaticamente. O advogado responsável deve revisar o enquadramento jurídico, a
              matriz de riscos do contrato e juntar as evidências do fato superveniente (ex.: índices oficiais, notícias de mercado).
            </p>
          </Secao>

          <Secao n="Anexo I" titulo="Notas fiscais que comprovam os preços pagos">
            {comprovantes.length ? (
              <table className="w-full text-xs tabular-nums">
                <thead>
                  <tr className="border-b border-gray-200 text-left text-gray-500">
                    <th className="py-1">Data</th>
                    <th className="py-1">Documento</th>
                    <th className="py-1">Fornecedor</th>
                    <th className="py-1">Item do orçamento</th>
                    <th className="py-1 text-right">Qtd.</th>
                    <th className="py-1 text-right">Unitário</th>
                    <th className="py-1 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {comprovantes.map((l) => (
                    <tr key={l.id} className="border-b border-gray-100">
                      <td className="py-1">{formatarData(l.data)}</td>
                      <td className="py-1">{l.documento || "—"}</td>
                      <td className="py-1">{l.fornecedor || "—"}</td>
                      <td className="py-1">{itensPorId[l.item_id]?.descricao || labelCategoria(l.categoria)}</td>
                      <td className="py-1 text-right">
                        {l.quantidade ? `${formatarNumero(l.quantidade)} ${l.unidade || ""}` : "—"}
                      </td>
                      <td className="py-1 text-right">{l.quantidade ? formatarBRL(l.valor_total / l.quantidade) : "—"}</td>
                      <td className="py-1 text-right">{formatarBRL(l.valor_total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="text-gray-500">Nenhum gasto vinculado a item do orçamento.</p>
            )}
          </Secao>
        </article>
      )}
    </ObrasLayout>
  );
}
