import { DB, RELACAO } from "./constants";
import { queryAll } from "./queryAll";
import { getTitle, getText, getStatus, getDate, getNumber, getRelationIds } from "./normalizers";

const FINALIZADOS = ["Empenhado", "Encaminhado para Pagamento"];

export async function buscarGerenciamentos(mapaAtas = {}) {
  const paginas = await queryAll(DB.GERENCIAMENTOS);
  return paginas.map((page) => normalizarGerenciamento(page, mapaAtas));
}

export function normalizarGerenciamento(page, mapaAtas = {}) {
  const p = page.properties;
  const relIds = getRelationIds(p[RELACAO.GERENCIAMENTO_PARA_ATA]);

  return {
    id: page.id,
    objeto: getTitle(p["Objeto"]),
    processo: getText(p["Processo SEI"]) || getText(p["Processo"]),
    demandante: getText(p["Demandante"]) || null, // campo ainda não existe no Notion
    periodo: getText(p["Período"]) || null, // campo ainda não existe no Notion
    status: getStatus(p["Status"]),
    finalizado: FINALIZADOS.includes(getStatus(p["Status"])),
    dataSolicitacao: getDate(p["Data Solicitação"]),
    prazoInterno: getDate(p["Prazo Interno"]),
    dataEmpenho: getDate(p["Data do(s) Empenho(s)"]),
    valorEstimado: getNumber(p["Valor Estimado"]),
    ata: relIds.map((id) => mapaAtas[id]).filter(Boolean)[0] || null,
    ataIds: relIds,
  };
}

export function resumoGerenciamentos(gerenciamentos) {
  const total = gerenciamentos.length;
  const ativosGerenciamento = gerenciamentos.filter((g) => !g.finalizado).length;
  const atrasadosGerenciamento = gerenciamentos.filter(
    (g) => !g.finalizado && g.prazoInterno && new Date(g.prazoInterno) < new Date()
  ).length;
  return { totalGerenciamentos: total, ativosGerenciamento, atrasadosGerenciamento };
}
