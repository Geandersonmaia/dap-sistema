"use server";

import { revalidatePath } from "next/cache";
import { sql } from "@/lib/db";
import { FUNCOES } from "@/lib/formato";

export async function cadastrarPessoa(_estado, fd) {
  const nome = String(fd.get("nome") || "").trim();
  const funcoes = fd.getAll("funcoes").filter((f) => f in FUNCOES);
  if (!nome) return { erro: "Informe o nome." };
  if (!funcoes.length) return { erro: "Marque ao menos uma função." };
  const posto = String(fd.get("posto") || "").trim() || null;
  const whatsapp = String(fd.get("whatsapp") || "").trim() || null;
  const orgao = ["CBMRO", "SESAU", "OUTRO"].includes(fd.get("orgao")) ? fd.get("orgao") : "CBMRO";
  await sql`insert into pessoas (nome, posto, funcoes, orgao, whatsapp)
            values (${nome}, ${posto}, ${funcoes}, ${orgao}, ${whatsapp})`;
  revalidatePath("/equipe");
  return { ok: `${nome} cadastrado(a).` };
}

export async function alternarAtivo(id) {
  await sql`update pessoas set ativo = not ativo where id = ${id}`;
  revalidatePath("/equipe");
}

export async function mudarSituacaoAeronave(fd) {
  const situacao = fd.get("situacao");
  if (!["disponivel", "manutencao", "indisponivel"].includes(situacao)) return;
  await sql`update aeronaves set situacao = ${situacao} where id = ${Number(fd.get("id"))}`;
  revalidatePath("/equipe");
  revalidatePath("/");
}
