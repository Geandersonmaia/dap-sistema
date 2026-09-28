import { Pool, types } from "pg";

// DATE volta como texto "AAAA-MM-DD" (sem fuso) e NUMERIC como número.
types.setTypeParser(1082, (v) => v);
types.setTypeParser(1700, (v) => (v === null ? null : parseFloat(v)));

// Conexão única reaproveitada entre requisições (evita abrir uma nova a cada chamada
// na Vercel). A string de conexão vem de DATABASE_URL (ex.: Neon, Supabase, Vercel Postgres).
const globalParaPool = globalThis;

function criarPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL não configurada. Crie um banco Postgres (ex.: Neon) e adicione a variável na Vercel."
    );
  }
  const local = /localhost|127\.0\.0\.1|host=\/|@\/|\/tmp/.test(connectionString);
  return new Pool({
    connectionString,
    max: 3,
    ssl: local ? false : { rejectUnauthorized: false },
  });
}

export function getPool() {
  if (!globalParaPool.__obrasPool) globalParaPool.__obrasPool = criarPool();
  return globalParaPool.__obrasPool;
}

const SCHEMA = `
CREATE TABLE IF NOT EXISTS obras (
  id               SERIAL PRIMARY KEY,
  nome             TEXT NOT NULL,
  contratante      TEXT,
  numero_contrato  TEXT,
  processo         TEXT,
  objeto           TEXT,
  valor_contrato   NUMERIC(16,2) NOT NULL DEFAULT 0,
  bdi_percent      NUMERIC(8,4)  NOT NULL DEFAULT 0,
  reajuste_percent NUMERIC(8,4)  NOT NULL DEFAULT 0,
  data_base        DATE,
  data_inicio      DATE,
  prazo_meses      INTEGER,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS itens_orcamento (
  id             SERIAL PRIMARY KEY,
  obra_id        INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  codigo         TEXT,
  categoria      TEXT NOT NULL DEFAULT 'material',
  descricao      TEXT NOT NULL,
  unidade        TEXT,
  quantidade     NUMERIC(16,4) NOT NULL DEFAULT 0,
  preco_unitario NUMERIC(16,4) NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lancamentos (
  id          SERIAL PRIMARY KEY,
  obra_id     INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  item_id     INTEGER REFERENCES itens_orcamento(id) ON DELETE SET NULL,
  data        DATE NOT NULL,
  categoria   TEXT NOT NULL DEFAULT 'material',
  descricao   TEXT NOT NULL,
  fornecedor  TEXT,
  documento   TEXT,
  quantidade  NUMERIC(16,4),
  unidade     TEXT,
  valor_total NUMERIC(16,2) NOT NULL DEFAULT 0,
  observacao  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS medicoes (
  id              SERIAL PRIMARY KEY,
  obra_id         INTEGER NOT NULL REFERENCES obras(id) ON DELETE CASCADE,
  numero          TEXT,
  data            DATE NOT NULL,
  valor           NUMERIC(16,2) NOT NULL DEFAULT 0,
  data_pagamento  DATE,
  observacao      TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_itens_obra ON itens_orcamento(obra_id);
CREATE INDEX IF NOT EXISTS idx_lanc_obra ON lancamentos(obra_id, data);
CREATE INDEX IF NOT EXISTS idx_med_obra ON medicoes(obra_id, data);
`;

// Cria as tabelas na primeira chamada — não precisa rodar nada manualmente no banco.
export async function db() {
  const pool = getPool();
  if (!globalParaPool.__obrasSchemaOk) {
    globalParaPool.__obrasSchemaOk = pool.query(SCHEMA).catch((e) => {
      globalParaPool.__obrasSchemaOk = null;
      throw e;
    });
  }
  await globalParaPool.__obrasSchemaOk;
  return pool;
}
