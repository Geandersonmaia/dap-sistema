"use client";

import Link from "next/link";
import ObrasLayout from "@/components/obras/ObrasLayout";
import Kpi from "@/components/obras/Kpi";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import { botaoPrimario } from "@/components/obras/Campo";
import { useObra } from "@/hooks/useObra";
import { formatarBRL, formatarData, formatarPct, formatarTrimestre, labelCategoria } from "@/lib/obras/calculos";

const hoje = () => new Date().toLocaleDateString("sv-SE");

function Pendencias({ ap, obraId }) {
  const itens = [
    ap.semDocumento.length > 0 && {
      nivel: "critico",
      texto: `${ap.semDocumento.length} gasto(s) sem nota fiscal/recibo (${formatarBRL(ap.valorSemDocumento)}) — NÃO deduzidos. Informe o documento em "Lançar gastos".`,
    },
    ap.semPagamento.length > 0 && {
      nivel: "atencao",
      texto: `${ap.semPagamento.length} gasto(s) sem data de pagamento — deduzidos pela data do lançamento, mas o comprovante de pagamento será exigido.`,
    },
    ap.naoRecebidas.length > 0 && {
      nivel: "info",
      texto: `${formatarBRL(ap.receitaNaoRecebida)} em medições ainda não pagas pelo órgão — fora de R até o recebimento.`,
    },
    ap.naoDedutiveis.length > 0 && {
      nivel: "info",
      texto: `${formatarBRL(ap.valorNaoDedutivel)} em despesas não dedutíveis (juros, multas, honorários) — excluídas, salvo aditivo escrito.`,
    },
  ].filter(Boolean);
  if (!itens.length) return null;
  const estilo = {
    critico: "border-red-200 bg-red-50 text-red-800",
    atencao: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-slate-200 bg-slate-50 text-slate-700",
  };
  const icone = { critico: "🔴", atencao: "🟡", info: "ℹ️" };
  return (
    <div className="space-y-2 print:hidden">
      {itens.map((i, k) => (
        <div key={k} className={`flex gap-2 rounded-lg border px-3 py-2 text-sm ${estilo[i.nivel]}`}>
          <span>{icone[i.nivel]}</span>
          <span>{i.texto}</span>
        </div>
      ))}
      <Link href={`/obras/${obraId}/lancamentos`} className="inline-block text-xs text-slate-700 underline">
        Corrigir lançamentos →
      </Link>
    </div>
  );
}

export default function ApuracaoPage({ params }) {
  const { dados, erro, recarregar } = useObra(params.id);
  const ap = dados?.apuracao;
  const ac = ap?.acumulado;
  const o = dados?.obra;
  const proximoPrazo = ap?.trimestres.find((t) => t.prazoDemonstrativo >= hoje());

  return (
    <ObrasLayout
      titulo="Apuração do lucro da obra"
      obraId={params.id}
      nomeObra={o?.nome}
      acoes={
        dados && (
          <button onClick={() => window.print()} className={botaoPrimario}>
            🖨️ Imprimir demonstrativo
          </button>
        )
      }
    >
      {erro && <ErrorState mensagem={erro} onRetry={recarregar} />}
      {!dados && !erro && <LoadingState />}
      {ap && (
        <div className="space-y-6">
          <div className="hidden text-center print:block">
            <p className="text-lg font-bold">Demonstrativo acumulado de receitas e custos da obra</p>
            <p className="text-sm">
              {o.nome}
              {o.numero_contrato ? ` — Contrato ${o.numero_contrato}` : ""} · posição em {formatarData(hoje())}
            </p>
          </div>

          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700 print:hidden">
            Apuração pelo regime de caixa: <b>P = máximo [0; R − T − CD − CI]</b>. Receita só entra quando paga pelo órgão;
            custo só é deduzido com documento idôneo; despesas não dedutíveis ficam fora.
            {ap.participacao > 0 && (
              <>
                {" "}
                Participação sobre o lucro: <b>{formatarPct(ap.participacao)}</b>.
              </>
            )}
          </p>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            <Kpi titulo="R · Receita recebida" valor={formatarBRL(ac.R)} cor="azul" />
            <Kpi titulo="T · Tributos" valor={formatarBRL(ac.T)} />
            <Kpi titulo="CD · Custos diretos" valor={formatarBRL(ac.CD)} />
            <Kpi titulo="CI · Custos indiretos" valor={formatarBRL(ac.CI)} />
            <Kpi
              titulo="P · Lucro da obra"
              valor={formatarBRL(ac.P)}
              cor={ac.resultado < 0 ? "vermelho" : "verde"}
              subtitulo={ac.resultado < 0 ? `▼ Resultado negativo: ${formatarBRL(ac.resultado)}` : undefined}
            />
            <Kpi
              titulo={`H · Participação (${formatarPct(ap.participacao, 0)})`}
              valor={formatarBRL(ac.H)}
              subtitulo={ac.P === 0 ? "P = 0 → H = 0" : undefined}
            />
          </div>

          {proximoPrazo && (
            <p className="text-sm text-gray-600 print:hidden">
              📅 Próximo demonstrativo trimestral ({formatarTrimestre(proximoPrazo.trimestre)}): entregar até{" "}
              <b>{formatarData(proximoPrazo.prazoDemonstrativo)}</b> (20º dia útil; confira feriados).
            </p>
          )}

          <Pendencias ap={ap} obraId={params.id} />

          <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm print:shadow-none">
            <table className="w-full text-sm tabular-nums">
              <thead>
                <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
                  <th className="px-3 py-2.5 font-medium">Acumulado até</th>
                  <th className="px-3 py-2.5 text-right font-medium">R</th>
                  <th className="px-3 py-2.5 text-right font-medium">T</th>
                  <th className="px-3 py-2.5 text-right font-medium">CD</th>
                  <th className="px-3 py-2.5 text-right font-medium">CI</th>
                  <th className="px-3 py-2.5 text-right font-medium">R − T − CD − CI</th>
                  <th className="px-3 py-2.5 text-right font-medium">P</th>
                  <th className="px-3 py-2.5 text-right font-medium">H</th>
                  <th className="px-3 py-2.5 text-right font-medium print:hidden">Entregar até</th>
                </tr>
              </thead>
              <tbody>
                {ap.trimestres.map((t) => (
                  <tr key={t.trimestre} className="border-b border-gray-50 last:border-0">
                    <td className="whitespace-nowrap px-3 py-2">
                      {formatarTrimestre(t.trimestre)} <span className="text-[11px] text-gray-400">({formatarData(t.fim)})</span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">{formatarBRL(t.R)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">{formatarBRL(t.T)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">{formatarBRL(t.CD)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">{formatarBRL(t.CI)}</td>
                    <td className={`whitespace-nowrap px-3 py-2 text-right ${t.resultado < 0 ? "text-red-700" : ""}`}>{formatarBRL(t.resultado)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">{formatarBRL(t.P)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right">{formatarBRL(t.H)}</td>
                    <td className="whitespace-nowrap px-3 py-2 text-right text-xs text-gray-500 print:hidden">{formatarData(t.prazoDemonstrativo)}</td>
                  </tr>
                ))}
                {!ap.trimestres.length && (
                  <tr>
                    <td colSpan={9} className="px-3 py-6 text-center text-gray-500">
                      Ainda não há recebimentos nem custos documentados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {ap.semDocumento.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm shadow-sm">
              <p className="mb-2 font-semibold text-gray-800">Gastos não deduzidos por falta de documento</p>
              <ul className="space-y-1 text-gray-600">
                {ap.semDocumento.slice(0, 50).map((l) => (
                  <li key={l.id}>
                    {formatarData(l.data)} · {l.descricao} · {labelCategoria(l.categoria)} · {formatarBRL(l.valor_total)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-gray-400">
            Demonstrativo gerencial. O demonstrativo final deve ser assinado pelo contador responsável, com conciliação entre
            registros contábeis, financeiros e documentos de suporte. Custos indiretos só entram com termo de rateio assinado
            antes da primeira apuração.
          </p>
        </div>
      )}
    </ObrasLayout>
  );
}
