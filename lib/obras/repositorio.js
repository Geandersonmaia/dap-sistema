import { db } from "./db";
import { CATEGORIAS } from "./constants";

const CATEGORIAS_VALIDAS = new Set(CATEGORIAS.map((c) => c.valor));

// Campos aceitos em cada tabela e como tratá-los. Qualquer outro campo enviado é ignorado.
const texto = (v) => (v === undefined || v === null || String(v).trim() === "" ? null : String(v).trim());
const numero = (v) => {
  if (v === undefined || v === null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  // Aceita "1.234,56" (formato brasileiro) e "1234.56".
  const s = String(v).trim().replace(/[R$\s]/g, "");
  const normalizado = s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s;
  const x = Number(normalizado);
  return Number.isFinite(x) ? x : null;
};
const data = (v) => (typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v) ? v.slice(0, 10) : null);
const inteiro = (v) => {
  const x = numero(v);
  return x === null ? null : Math.round(x);
};
const categoria = (v) => (CATEGORIAS_VALIDAS.has(v) ? v : "outros");

export const TABELAS = {
  obras: {
    campos: {
      nome: texto,
      contratante: texto,
      numero_contrato: texto,
      processo: texto,
      objeto: texto,
      valor_contrato: numero,
      bdi_percent: numero,
      reajuste_percent: numero,
      data_base: data,
      data_inicio: data,
      prazo_meses: inteiro,
    },
    obrigatorios: ["nome"],
  },
  itens: {
    tabela: "itens_orcamento",
    campos: {
      codigo: texto,
      categoria,
      descricao: texto,
      unidade: texto,
      quantidade: numero,
      preco_unitario: numero,
    },
    obrigatorios: ["descricao"],
    ordem: "categoria, descricao",
  },
  lancamentos: {
    tabela: "lancamentos",
    campos: {
      item_id: inteiro,
      data,
      categoria,
      descricao: texto,
      fornecedor: texto,
      documento: texto,
      quantidade: numero,
      unidade: texto,
      valor_total: numero,
      observacao: texto,
    },
    obrigatorios: ["data", "descricao", "valor_total"],
    ordem: "data DESC, id DESC",
  },
  medicoes: {
    tabela: "medicoes",
    campos: {
      numero: texto,
      data,
      valor: numero,
      data_pagamento: data,
      observacao: texto,
    },
    obrigatorios: ["data", "valor"],
    ordem: "data, id",
  },
};

export class ErroValidacao extends Error {}

function limpar(config, corpo, parcial = false) {
  const limpo = {};
  for (const [campo, fn] of Object.entries(config.campos)) {
    if (parcial && !(campo in corpo)) continue;
    limpo[campo] = fn(corpo[campo]);
  }
  if (!parcial) {
    for (const campo of config.obrigatorios) {
      if (limpo[campo] === null || limpo[campo] === undefined) {
        throw new ErroValidacao(`Campo obrigatório: ${campo}`);
      }
    }
  } else {
    for (const campo of config.obrigatorios) {
      if (campo in limpo && limpo[campo] === null) throw new ErroValidacao(`Campo obrigatório: ${campo}`);
    }
  }
  // Colunas NOT NULL com default: não gravar null explícito.
  for (const campo of ["valor_contrato", "bdi_percent", "reajuste_percent", "quantidade", "preco_unitario"]) {
    if (campo in limpo && limpo[campo] === null && config.tabela !== "lancamentos") limpo[campo] = 0;
  }
  return limpo;
}

export async function listarObras() {
  const pool = await db();
  const [obras, itens, lancs, meds] = await Promise.all([
    pool.query("SELECT * FROM obras ORDER BY created_at DESC"),
    pool.query("SELECT * FROM itens_orcamento"),
    pool.query("SELECT * FROM lancamentos"),
    pool.query("SELECT * FROM medicoes"),
  ]);
  return obras.rows.map((obra) => ({
    obra,
    itens: itens.rows.filter((r) => r.obra_id === obra.id),
    lancamentos: lancs.rows.filter((r) => r.obra_id === obra.id),
    medicoes: meds.rows.filter((r) => r.obra_id === obra.id),
  }));
}

export async function buscarObra(id) {
  const pool = await db();
  const { rows } = await pool.query("SELECT * FROM obras WHERE id = $1", [id]);
  if (!rows.length) return null;
  const [itens, lancamentos, medicoes] = await Promise.all(
    ["itens", "lancamentos", "medicoes"].map((r) =>
      pool
        .query(`SELECT * FROM ${TABELAS[r].tabela} WHERE obra_id = $1 ORDER BY ${TABELAS[r].ordem}`, [id])
        .then((res) => res.rows)
    )
  );
  return { obra: rows[0], itens, lancamentos, medicoes };
}

export async function criarObra(corpo) {
  const pool = await db();
  const limpo = limpar(TABELAS.obras, corpo);
  const cols = Object.keys(limpo);
  const { rows } = await pool.query(
    `INSERT INTO obras (${cols.join(",")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(",")}) RETURNING *`,
    cols.map((c) => limpo[c])
  );
  return rows[0];
}

export async function atualizarObra(id, corpo) {
  const pool = await db();
  const limpo = limpar(TABELAS.obras, corpo, true);
  const cols = Object.keys(limpo);
  if (!cols.length) throw new ErroValidacao("Nada para atualizar");
  const { rows } = await pool.query(
    `UPDATE obras SET ${cols.map((c, i) => `${c} = $${i + 2}`).join(", ")}, updated_at = now() WHERE id = $1 RETURNING *`,
    [id, ...cols.map((c) => limpo[c])]
  );
  return rows[0] || null;
}

export async function excluirObra(id) {
  const pool = await db();
  const { rowCount } = await pool.query("DELETE FROM obras WHERE id = $1", [id]);
  return rowCount > 0;
}

function configRecurso(recurso) {
  const config = TABELAS[recurso];
  if (!config || !config.tabela) throw new ErroValidacao("Recurso inválido");
  return config;
}

async function validarItemDaObra(client, obraId, limpo) {
  if (limpo.item_id) {
    const { rows } = await client.query("SELECT categoria, unidade FROM itens_orcamento WHERE id = $1 AND obra_id = $2", [
      limpo.item_id,
      obraId,
    ]);
    if (!rows.length) throw new ErroValidacao("Item do orçamento não pertence a esta obra");
  }
}

// Aceita um objeto ou uma lista (importação em lote da planilha).
export async function criarRegistros(obraId, recurso, corpo) {
  const config = configRecurso(recurso);
  const pool = await db();
  const lista = Array.isArray(corpo) ? corpo : [corpo];
  if (!lista.length) throw new ErroValidacao("Nenhum registro enviado");
  if (lista.length > 2000) throw new ErroValidacao("Máximo de 2000 registros por envio");

  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const existe = await client.query("SELECT 1 FROM obras WHERE id = $1", [obraId]);
    if (!existe.rows.length) throw new ErroValidacao("Obra não encontrada");
    const criados = [];
    for (const item of lista) {
      const limpo = limpar(config, item);
      await validarItemDaObra(client, obraId, limpo);
      const cols = ["obra_id", ...Object.keys(limpo)];
      const vals = [obraId, ...Object.values(limpo)];
      const { rows } = await client.query(
        `INSERT INTO ${config.tabela} (${cols.join(",")}) VALUES (${cols.map((_, i) => `$${i + 1}`).join(",")}) RETURNING *`,
        vals
      );
      criados.push(rows[0]);
    }
    await client.query("COMMIT");
    return Array.isArray(corpo) ? criados : criados[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

export async function atualizarRegistro(obraId, recurso, id, corpo) {
  const config = configRecurso(recurso);
  const pool = await db();
  const limpo = limpar(config, corpo, true);
  const cols = Object.keys(limpo);
  if (!cols.length) throw new ErroValidacao("Nada para atualizar");
  await validarItemDaObra(pool, obraId, limpo);
  const { rows } = await pool.query(
    `UPDATE ${config.tabela} SET ${cols.map((c, i) => `${c} = $${i + 3}`).join(", ")} WHERE id = $1 AND obra_id = $2 RETURNING *`,
    [id, obraId, ...cols.map((c) => limpo[c])]
  );
  return rows[0] || null;
}

export async function excluirRegistro(obraId, recurso, id) {
  const config = configRecurso(recurso);
  const pool = await db();
  const { rowCount } = await pool.query(`DELETE FROM ${config.tabela} WHERE id = $1 AND obra_id = $2`, [id, obraId]);
  return rowCount > 0;
}
