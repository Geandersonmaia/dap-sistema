"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { registrarEvento, sql } from "@/lib/db";
import { FUNCOES_MISSAO } from "@/lib/formato";

const texto = (fd, k) => String(fd.get(k) || "").trim() || null;

export async function criarMissao(_estado, fd) {
  const aeronaveId = Number(fd.get("aeronave_id"));
  if (!aeronaveId) return { erro: "Escolha a aeronave." };
  const equipe = FUNCOES_MISSAO.map((f) => ({ funcao: f, pessoaId: Number(fd.get(`equipe_${f}`)) })).filter(
    (e) => e.pessoaId
  );
  if (!equipe.some((e) => e.funcao === "piloto")) return { erro: "Escolha ao menos o piloto." };

  // Horário digitado é o de Porto Velho (UTC-4)
  const previsao = texto(fd, "previsao") ? `${texto(fd, "previsao")}:00-04:00` : null;
  const ano = new Date().getFullYear();
  const [{ n }] = await sql`select count(*)::int + 1 as n from missoes where numero like ${ano + "/%"}`;
  const numero = `${ano}/${String(n).padStart(3, "0")}`;

  const [missao] = await sql`
    insert into missoes (numero, tipo, aeronave_id, origem, destino, hospital, previsao,
                         paciente_nome, paciente_idade, paciente_condicao, observacoes)
    values (${numero}, ${texto(fd, "tipo") || "Transporte aeromédico"}, ${aeronaveId}, ${texto(fd, "origem")},
            ${texto(fd, "destino")}, ${texto(fd, "hospital")}, ${previsao}, ${texto(fd, "paciente_nome")},
            ${texto(fd, "paciente_idade")}, ${texto(fd, "paciente_condicao")}, ${texto(fd, "observacoes")})
    returning id`;
  for (const e of equipe) {
    await sql`insert into missao_equipe (missao_id, pessoa_id, funcao) values (${missao.id}, ${e.pessoaId}, ${e.funcao})`;
  }
  await registrarEvento(missao.id, "criada", { equipe: equipe.length });
  revalidatePath("/");
  redirect(`/missoes/${missao.id}`);
}

// Chamado quando o Márcio toca em "Enviar no WhatsApp"
export async function marcarEnviado(membroId) {
  const [m] = await sql`
    update missao_equipe set status = 'enviado', enviado_em = now()
    where id = ${membroId} and status = 'pendente'
    returning missao_id`;
  if (m) {
    await registrarEvento(m.missao_id, "enviado", { membro: membroId });
    revalidatePath(`/missoes/${m.missao_id}`);
  }
}

export async function responder(membroId, resposta) {
  if (!["confirmado", "recusou", "enviado"].includes(resposta)) return;
  const [m] = await sql`
    update missao_equipe set status = ${resposta}, respondido_em = ${resposta === "enviado" ? null : new Date()}
    where id = ${membroId}
    returning missao_id`;
  await registrarEvento(m.missao_id, resposta, { membro: membroId });
  await atualizarProntidao(m.missao_id);
  revalidatePath(`/missoes/${m.missao_id}`);
}

export async function substituir(membroId, novaPessoaId) {
  const [antigo] = await sql`
    update missao_equipe set status = 'substituido' where id = ${membroId}
    returning missao_id, funcao, pessoa_id`;
  await sql`insert into missao_equipe (missao_id, pessoa_id, funcao)
            values (${antigo.missao_id}, ${Number(novaPessoaId)}, ${antigo.funcao})`;
  await registrarEvento(antigo.missao_id, "substituido", { saiu: antigo.pessoa_id, entrou: Number(novaPessoaId) });
  await atualizarProntidao(antigo.missao_id);
  revalidatePath(`/missoes/${antigo.missao_id}`);
}

export async function mudarStatusMissao(missaoId, status) {
  if (!["acionada", "concluida", "cancelada"].includes(status)) return;
  await sql`update missoes set status = ${status}, atualizado_em = now() where id = ${missaoId}`;
  await registrarEvento(missaoId, `missao_${status}`);
  if (status === "acionada") await atualizarProntidao(missaoId);
  revalidatePath(`/missoes/${missaoId}`);
  revalidatePath("/");
}

// Missão fica "pronta" quando toda a equipe ativa confirmou
async function atualizarProntidao(missaoId) {
  const [r] = await sql`
    select count(*) filter (where status <> 'substituido') as total,
           count(*) filter (where status = 'confirmado') as ok
    from missao_equipe where missao_id = ${missaoId}`;
  const pronta = Number(r.total) > 0 && Number(r.total) === Number(r.ok);
  await sql`
    update missoes set status = ${pronta ? "pronta" : "acionada"}, atualizado_em = now()
    where id = ${missaoId} and status in ('acionada', 'pronta')`;
  revalidatePath("/");
}
