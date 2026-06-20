import { DB, RELACAO } from "../constants";
import { queryAll } from "../queryAll";
import {
  getTitle,
  getText,
  getStatus,
  getDate,
  getNumber,
  getFormula,
  getCheckbox,
  getPhone,
  getRelationIds,
} from "../normalizers";

const FINALIZADOS = ["Encaminhado para Pagamento", "Liquidado"];

export async function buscarLiquidacoes(mapaAtas = {}) {
  const paginas = await queryAll(DB.LIQUIDACAO);
  return paginas.map((page) => normalizarLiquidacao(page, mapaAtas));
}

export function normalizarLiquidacao(page, mapaAtas = {}) {
  const p = page.properties;
  const relIds = getRelationIds(p[RELACAO.LIQUIDACAO_PARA_ATA]);
  const status = getStatus(p["Status"]);

  return {
    id: page.id,
    fornecedor: getTitle(p["Fornecedor"]),
    cnpj: getText(p["CNPJ"]) || null, // campo ainda não existe no Notion
    notaFiscal: getText(p["Nota Fiscal"]) || null, // campo ainda não existe no Notion
    valor: getNumber(p["Valor"]), // campo ainda não existe no Notion
    ne: getText(p["NE"]),
    processoSEI: getText(p["SEI Liquidação"]),
    status,
    finalizado: FINALIZADOS.includes(status),
    liquidacao: getStatus(p["Liquidação"]),
    entrega: getDate(p["Entrega"]),
    dataEnvioNE: getDate(p["Data Envio NE"]),
    notificacoes: getNumber(p["Notificações"]),
    prazoStatus: getFormula(p[""]),
    acaoRecomendada: getFormula(p["Ação Recomendada"]),
    diasRestantes: getFormula(p["Dias Restantes"]),
    prazoFinal: getFormula(p["Prazo Final"]),
    concluido: getCheckbox(p["Concluído"]),
    confirmadoJuridico: getCheckbox(p["Confirmado Jurídico"]),
    whatsapp: getPhone(p["Whats app"]),
    email: getText(p["e-mail (proposta)"]),
    ata: relIds.map((id) => mapaAtas[id]).filter(Boolean)[0] || null,
    ataIds: relIds,
  };
}

export function resumoLiquidacoes(liquidacoes) {
  const total = liquidacoes.length;
  let vencidasLiquidacao = 0;
  let vencendoEmBreve = 0;
  let pendentesRecebimento = 0;
  let pendentesAtesto = 0;
  let encaminhadasPagamento = 0;
  let valorTotalPendente = 0;

  for (const l of liquidacoes) {
    if (typeof l.prazoStatus === "string" && l.prazoStatus.includes("Vencido")) vencidasLiquidacao++;
    if (typeof l.prazoStatus === "string" && l.prazoStatus.includes("Vence em Breve")) vencendoEmBreve++;
    if (l.status === "Aguardando Entrega") pendentesRecebimento++;
    if (l.status === "Aguardando Atesto") pendentesAtesto++;
    if (l.status === "Encaminhado para Pagamento") encaminhadasPagamento++;
    if (!l.finalizado && l.valor) valorTotalPendente += l.valor;
  }

  return {
    totalLiquidacoes: total,
    vencidasLiquidacao,
    vencendoEmBreve,
    pendentesRecebimento,
    pendentesAtesto,
    encaminhadasPagamento,
    valorTotalPendente,
  };
}
