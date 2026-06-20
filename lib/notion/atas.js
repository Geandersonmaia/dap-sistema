import { DB } from "./constants";
import { queryAll } from "./queryAll";
import {
  getTitle,
  getText,
  getSelect,
  getDate,
  getNumber,
  getFormula,
  diasAPartirDeHoje,
} from "./normalizers";

export async function buscarAtas() {
  const paginas = await queryAll(DB.ATAS);
  return paginas.map((page) => normalizarAta(page));
}

export function normalizarAta(page) {
  const p = page.properties;
  const vigenciaFinal = getDate(p["Vigência Final"]);
  const dias = diasAPartirDeHoje(vigenciaFinal);
  const valorGlobalHomologado = getNumber(p["Valor Global  Homologado"]);
  const valorTotalGerenciado = getFormula(p["Valor Total Gerenciado"]);
  const saldo =
    typeof valorGlobalHomologado === "number" && typeof valorTotalGerenciado === "number"
      ? valorGlobalHomologado - valorTotalGerenciado
      : null;

  return {
    id: page.id,
    ata: getTitle(p["ATA"]),
    objeto: getText(p["Objeto"]),
    processoSEI: getText(p["Processo Implantação (SEI)"]),
    vigenciaFinal,
    diasParaVencer: dias,
    statusPainel: getSelect(p["Status (Painel)"]),
    situacaoAta: getFormula(p["Situação da ATA"]),
    statusConsumo: getFormula(p["Status Consumo"]),
    percentualConsumido: getFormula(p["Percentual Consumido %"]),
    valorGlobalHomologado,
    valorTotalGerenciado,
    saldo,
    qtdeGerenciamentos: getFormula(p["Qtde de Gerenciamentos"]),
    anoPublicacao: getText(p["Ano de Publicação"]),
    observacoes: getText(p["Observações"]),
  };
}

export function montarMapaAtas(atas) {
  const mapa = {};
  for (const a of atas) {
    mapa[a.id] = a.ata || a.objeto || "Ata sem nome";
  }
  return mapa;
}

export function resumoAtas(atas) {
  const total = atas.length;
  let ativas = 0;
  let vencidas = 0;
  let saldoBaixo = 0;
  let reimplantacaoUrgente = 0;

  for (const a of atas) {
    if (a.statusPainel === "🟢 Ativa") ativas++;
    if (a.statusPainel === "🔴 Encerrada") vencidas++;
    if (a.statusPainel === "🟡 Saldo Baixo") saldoBaixo++;
    if (a.statusPainel === "🟠 Em Reimplantação") reimplantacaoUrgente++;
    // fallback: se o campo Status (Painel) estiver vazio, usa a data de vigência
    if (!a.statusPainel && a.diasParaVencer !== null && a.diasParaVencer < 0) vencidas++;
  }

  return {
    totalAtas: total,
    ativas,
    vencidas,
    saldoBaixo,
    reimplantacaoUrgente,
  };
}
