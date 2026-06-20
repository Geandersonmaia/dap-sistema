// Não existe uma base própria de Fornecedores no Notion — essa visão é
// montada agregando os registros de Liquidação por nome de fornecedor.

export function montarFornecedores(liquidacoes) {
  const mapa = {};

  for (const l of liquidacoes) {
    const nome = l.fornecedor || "Sem nome";
    if (!mapa[nome]) {
      mapa[nome] = {
        fornecedor: nome,
        cnpj: l.cnpj || null,
        quantidadeProcessos: 0,
        quantidadeVencidos: 0,
        quantidadePendencias: 0,
        valorTotal: 0,
        ultimaMovimentacao: null,
      };
    }
    const f = mapa[nome];
    f.quantidadeProcessos++;
    if (!f.cnpj && l.cnpj) f.cnpj = l.cnpj;
    if (typeof l.prazoStatus === "string" && l.prazoStatus.includes("Vencido")) f.quantidadeVencidos++;
    if (!l.finalizado) f.quantidadePendencias++;
    if (l.valor) f.valorTotal += l.valor;

    const dataRef = l.entrega || l.dataEnvioNE;
    if (dataRef && (!f.ultimaMovimentacao || new Date(dataRef) > new Date(f.ultimaMovimentacao))) {
      f.ultimaMovimentacao = dataRef;
    }
  }

  return Object.values(mapa).sort((a, b) => b.quantidadePendencias - a.quantidadePendencias);
}

export function rankingsFornecedores(fornecedores) {
  const maisPendencias = [...fornecedores].sort((a, b) => b.quantidadePendencias - a.quantidadePendencias).slice(0, 5);
  const maisVencidos = [...fornecedores].sort((a, b) => b.quantidadeVencidos - a.quantidadeVencidos).slice(0, 5);
  const maiorValorPendente = [...fornecedores].sort((a, b) => b.valorTotal - a.valorTotal).slice(0, 5);
  return { maisPendencias, maisVencidos, maiorValorPendente };
}
