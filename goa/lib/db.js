import { neon, neonConfig } from "@neondatabase/serverless";

// Permite apontar para um emulador local do Neon em testes
if (process.env.NEON_FETCH_ENDPOINT) neonConfig.fetchEndpoint = process.env.NEON_FETCH_ENDPOINT;

// no-store: impede o Next.js de guardar respostas do banco em cache (dados sempre atuais)
export const sql = neon(process.env.DATABASE_URL, { fetchOptions: { cache: "no-store" } });

export async function registrarEvento(missaoId, tipo, detalhe = null) {
  await sql`insert into eventos (missao_id, tipo, detalhe) values (${missaoId}, ${tipo}, ${detalhe})`;
}
