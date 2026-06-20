import { DB, RELACAO } from "./constants";
import { queryAll } from "./queryAll";
import { getTitle, getText, getNumber, getFormula, getRelationIds } from "./normalizers";

export async function buscarItens(mapaAtas = {}) {
  const paginas = await queryAll(DB.ITENS);
  return paginas.map((page) => normalizarItem(page, mapaAtas));
}

export function normalizarItem(page, mapaAtas = {}) {
  const p = page.properties;
  const relIds = getRelationIds(p[RELACAO.ITENS_PARA_ATA]);

  return {
    id: page.id,
    item: getTitle(p["Item"]),
    descricao: getText(p["Descrição"]) || getTitle(p["Item"]),
    codigo: getText(p["Código"]),
    unidade: getText(p["Unidade"]),
    quantidadeRegistrada: getNumber(p["Quantidade Registrada"]),
    quantidadeGerenciada: getNumber(p["Quantidade Gerenciada"]),
    saldoQuantidade: getFormula(p["Saldo Quantidade"]),
    percentualConsumido: getFormula(p["Percentual Consumido"]),
    situacaoItem: getFormula(p["Situação do Item"]),
    situacaoPorSaldo: getFormula(p["Situação por Saldo"]),
    valorUnitario: getNumber(p["Valor Unitário"]),
    valorTotalItem: getFormula(p["Valor Total Item"]),
    atas: relIds.map((id) => mapaAtas[id]).filter(Boolean),
    ataIds: relIds,
  };
}
