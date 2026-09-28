"use client";

import Link from "next/link";
import ObrasLayout from "@/components/obras/ObrasLayout";
import Lucrometro from "@/components/obras/Lucrometro";
import Kpi from "@/components/obras/Kpi";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import { botaoPrimario } from "@/components/obras/Campo";
import { useDados } from "@/hooks/useObra";
import { formatarBRL, formatarPct } from "@/lib/obras/calculos";

export default function ObrasPage() {
  const { dados, erro, carregando, recarregar } = useDados("/api/obras");
  const obras = dados?.obras || [];
  const total = (k) => obras.reduce((a, o) => a + (o[k] || 0), 0);
  const receita = total("receitaMedida");
  const custo = total("custoReal");
  const margemGeral = receita > 0 ? (receita - custo) / receita : null;

  return (
    <ObrasLayout
      titulo="Obras"
      acoes={
        <Link href="/obras/nova" className={botaoPrimario}>
          + Nova obra
        </Link>
      }
    >
      {carregando && !dados && <LoadingState texto="Carregando obras..." />}
      {erro && <ErrorState mensagem={erro} onRetry={recarregar} />}

      {dados && !erro && obras.length === 0 && (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center">
          <p className="text-4xl">🏗️</p>
          <p className="mt-2 font-semibold text-gray-800">Nenhuma obra cadastrada ainda</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-gray-500">
            Comece cadastrando o contrato. Depois lance o orçamento (planilha), as medições e todos os gastos da obra.
          </p>
          <Link href="/obras/nova" className={`${botaoPrimario} mt-4 inline-block`}>
            Cadastrar primeira obra
          </Link>
        </div>
      )}

      {obras.length > 0 && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi titulo="Obras" valor={obras.length} />
            <Kpi titulo="Receita medida (todas)" valor={formatarBRL(receita)} cor="azul" />
            <Kpi titulo="Custo real (todas)" valor={formatarBRL(custo)} />
            <Kpi
              titulo="Margem geral"
              valor={formatarPct(margemGeral)}
              cor={margemGeral === null ? "cinza" : margemGeral < 0 ? "vermelho" : "verde"}
              subtitulo={margemGeral !== null && margemGeral < 0 ? "🔻 Prejuízo consolidado" : undefined}
             
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {obras.map((o) => (
              <Link key={o.id} href={`/obras/${o.id}`} className="block rounded-xl transition hover:ring-2 hover:ring-slate-300">
                <Lucrometro
                  compacto
                  titulo={o.nome}
                  margem={o.margem}
                  situacao={o.situacao}
                  resultado={o.resultado}
                />
                <div className="-mt-3 rounded-b-xl border border-t-0 border-gray-200 bg-white px-5 pb-4 pt-3 text-xs text-gray-500">
                  <p className="truncate">{o.contratante || "—"} {o.numero_contrato ? `· Contrato ${o.numero_contrato}` : ""}</p>
                  <p className="mt-1">
                    Executado {formatarPct(o.execucao)} de {formatarBRL(o.valorContrato)}
                    {o.reequilibrioEstimado > 0 && (
                      <span className="ml-1 font-semibold text-red-700">· reequilíbrio estimado {formatarBRL(o.reequilibrioEstimado)}</span>
                    )}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </ObrasLayout>
  );
}
