import { Client } from "@notionhq/client";

// ⚠️ O nome desta variável precisa ser EXATAMENTE igual ao que você
// for criar em Vercel > Settings > Environment Variables.
export const notion = new Client({ auth: process.env.NOTION_API_KEY });

// IDs confirmados diretamente no workspace do Notion em 20/06/2026.
export const DB = {
  ATAS: "37889f1c-f8ec-8064-804d-ce1d502abf47",
  ITENS: "37b89f1c-f8ec-8014-b1bc-f54af3ac0177",
  GERENCIAMENTOS: "37889f1c-f8ec-8018-ad1d-d1312e5856aa",
  LIQUIDACAO: "37889f1c-f8ec-8003-84e5-f2ca49fe8024",
  IMPLANTACOES: "37789f1c-f8ec-8053-974a-c88f94195dd0",
};

// Nome do campo de relação em ITENS DA ATA que aponta pra ATAS VIGENTES.
// Atenção: tem um espaço no final, é assim que está cadastrado no Notion.
export const RELACAO_ATA_EM_ITENS = "ATAS VIGENTES - DAP ";

// ---------- Helpers de leitura de propriedades do Notion ----------
export const getTitle = (p) => p?.title?.[0]?.plain_text?.trim() || "";
export const getText = (p) => p?.rich_text?.[0]?.plain_text?.trim() || "";
export const getSelect = (p) => p?.select?.name || null;
export const getStatus = (p) => p?.status?.name || null;
export const getDateStart = (p) => p?.date?.start || null;
export const getNumber = (p) => (typeof p?.number === "number" ? p.number : null);
export const getRelationIds = (p) => (p?.relation || []).map((r) => r.id);
export const getCheckbox = (p) => !!p?.checkbox;

export const getFormulaValue = (p) => {
  if (!p?.formula) return null;
  if (p.formula.type === "string") return p.formula.string;
  if (p.formula.type === "number") return p.formula.number;
  if (p.formula.type === "boolean") return p.formula.boolean;
  return null;
};

// Busca TODAS as páginas de uma base, paginando automaticamente.
export async function queryAll(database_id, filter) {
  let results = [];
  let cursor = undefined;
  do {
    const resp = await notion.databases.query({
      database_id,
      filter,
      start_cursor: cursor,
      page_size: 100,
    });
    results = results.concat(resp.results);
    cursor = resp.has_more ? resp.next_cursor : undefined;
  } while (cursor);
  return results;
}

export function diasAPartirDeHoje(dataISO) {
  if (!dataISO) return null;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const data = new Date(dataISO);
  data.setHours(0, 0, 0, 0);
  return Math.round((data - hoje) / 86400000);
}
