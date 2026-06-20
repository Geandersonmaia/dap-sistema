// Todas essas funções são "seguras": se a propriedade não existir ou vier
// em formato inesperado, retornam um valor neutro (null, "", etc.) em vez
// de quebrar a página. Isso permite que campos ainda não criados no Notion
// (como CNPJ, Nota Fiscal, Valor, Demandante) simplesmente apareçam em
// branco até serem cadastrados — sem precisar alterar este código depois.

export function getTitle(prop) {
  try {
    return prop?.title?.[0]?.plain_text?.trim() || "";
  } catch {
    return "";
  }
}

export function getText(prop) {
  try {
    return prop?.rich_text?.[0]?.plain_text?.trim() || "";
  } catch {
    return "";
  }
}

export function getSelect(prop) {
  return prop?.select?.name ?? null;
}

export function getStatus(prop) {
  return prop?.status?.name ?? null;
}

export function getDate(prop) {
  return prop?.date?.start ?? null;
}

export function getNumber(prop) {
  return typeof prop?.number === "number" ? prop.number : null;
}

export function getCheckbox(prop) {
  return !!prop?.checkbox;
}

export function getPhone(prop) {
  return prop?.phone_number ?? null;
}

export function getRelationIds(prop) {
  return (prop?.relation || []).map((r) => r.id);
}

export function getFormula(prop) {
  if (!prop?.formula) return null;
  const tipo = prop.formula.type;
  if (tipo === "string") return prop.formula.string ?? null;
  if (tipo === "number") return prop.formula.number ?? null;
  if (tipo === "boolean") return prop.formula.boolean ?? null;
  return null;
}

// ---------- Cálculos de data ----------

export function diasAPartirDeHoje(dataISO) {
  if (!dataISO) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataISO);
  data.setHours(0, 0, 0, 0);
  return Math.round((data - hoje) / 86400000);
}

export function estaVencido(dataISO) {
  const dias = diasAPartirDeHoje(dataISO);
  return dias !== null && dias < 0;
}

export function venceEmBreve(dataISO, limiteDias = 7) {
  const dias = diasAPartirDeHoje(dataISO);
  return dias !== null && dias >= 0 && dias <= limiteDias;
}

// ---------- Formatação ----------

export function formatarMoeda(valor) {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return "—";
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor);
}

export function formatarData(dataISO) {
  if (!dataISO) return "—";
  try {
    return new Date(dataISO).toLocaleDateString("pt-BR");
  } catch {
    return "—";
  }
}

export function formatarPercentual(valor) {
  if (valor === null || valor === undefined) return "—";
  // Lida tanto com formato 0-1 quanto 0-100
  const pct = valor <= 1 ? valor * 100 : valor;
  return `${pct.toFixed(0)}%`;
}
