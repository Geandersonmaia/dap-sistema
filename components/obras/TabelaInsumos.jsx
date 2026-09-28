import { formatarBRL, formatarNumero, formatarPct, labelCategoria } from "@/lib/obras/calculos";

// Comparativo preço orçado × preço pago, item a item. Base do pedido de reequilíbrio.
export default function TabelaInsumos({ itens, reajuste, somenteComCompras = false, compacta = false }) {
  const linhas = (somenteComCompras ? itens.filter((i) => i.puReal !== null) : itens)
    .slice()
    .sort((a, b) => (b.impactoProjetado || 0) - (a.impactoProjetado || 0));

  if (!linhas.length) {
    return (
      <p className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-center text-sm text-gray-500">
        Nenhuma compra vinculada a itens do orçamento ainda. Ao lançar um gasto, escolha o item do orçamento a que ele se refere.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm print:overflow-visible print:shadow-none">
      <table className={`w-full tabular-nums ${compacta ? "text-[11px] [&_td]:px-1.5 [&_th]:px-1.5" : "text-sm"}`}>
        <thead>
          <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
            <th className="px-3 py-2.5 font-medium">Insumo / serviço</th>
            <th className="px-3 py-2.5 text-right font-medium">Qtd. orçada</th>
            <th className="px-3 py-2.5 text-right font-medium">Preço orçado</th>
            {reajuste > 0 && <th className="px-3 py-2.5 text-right font-medium">Orçado + reajuste</th>}
            <th className="px-3 py-2.5 text-right font-medium">Qtd. comprada</th>
            <th className="px-3 py-2.5 text-right font-medium">Preço médio pago</th>
            <th className="px-3 py-2.5 text-right font-medium">Variação</th>
            <th className="px-3 py-2.5 text-right font-medium">Impacto já sofrido</th>
            <th className="px-3 py-2.5 text-right font-medium">Impacto até o fim</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map((i) => (
            <tr key={i.id} className="border-b border-gray-50 last:border-0">
              <td className="px-3 py-2">
                <p className="font-medium text-gray-800">{i.descricao}</p>
                <p className="text-[11px] text-gray-400">
                  {i.codigo ? `${i.codigo} · ` : ""}
                  {labelCategoria(i.categoria)}
                </p>
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">
                {formatarNumero(i.qtdOrcada)} {i.unidade}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">{formatarBRL(i.puOrcado)}</td>
              {reajuste > 0 && <td className="whitespace-nowrap px-3 py-2 text-right">{formatarBRL(i.puReajustado)}</td>}
              <td className="whitespace-nowrap px-3 py-2 text-right">
                {i.qtdReal ? `${formatarNumero(i.qtdReal)} ${i.unidade || ""}` : "—"}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">{i.puReal !== null ? formatarBRL(i.puReal) : "—"}</td>
              <td
                className={`whitespace-nowrap px-3 py-2 text-right font-semibold ${
                  i.variacao === null ? "text-gray-400" : i.variacao > 0 ? "text-red-700" : "text-green-700"
                }`}
              >
                {i.variacao === null ? "—" : `${i.variacao > 0 ? "▲ +" : "▼ "}${formatarPct(i.variacao)}`}
              </td>
              <td className="whitespace-nowrap px-3 py-2 text-right">{i.puReal !== null ? formatarBRL(i.impactoRealizado) : "—"}</td>
              <td className="whitespace-nowrap px-3 py-2 text-right font-semibold">
                {i.puReal !== null ? formatarBRL(i.impactoProjetado) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
