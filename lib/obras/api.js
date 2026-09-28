import { NextResponse } from "next/server";
import { ErroValidacao } from "./repositorio";

export function idValido(valor) {
  const id = Number(valor);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function responder(fn) {
  try {
    const resultado = await fn();
    if (resultado === null || resultado === undefined) {
      return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
    }
    return NextResponse.json(resultado);
  } catch (e) {
    if (e instanceof ErroValidacao) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    console.error("[obras]", e);
    return NextResponse.json({ error: e.message || "Erro interno" }, { status: 500 });
  }
}

export async function lerJSON(request) {
  try {
    return await request.json();
  } catch {
    throw new ErroValidacao("JSON inválido");
  }
}
