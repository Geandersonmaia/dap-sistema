import { analisarObra } from "@/lib/obras/calculos";
import { atualizarObra, buscarObra, excluirObra } from "@/lib/obras/repositorio";
import { idValido, lerJSON, responder } from "@/lib/obras/api";

export const dynamic = "force-dynamic";

export async function GET(_request, { params }) {
  return responder(async () => {
    const id = idValido(params.id);
    const dados = id && (await buscarObra(id));
    if (!dados) return null;
    return {
      ...dados,
      analise: analisarObra(dados.obra, dados.itens, dados.lancamentos, dados.medicoes),
      atualizadoEm: new Date().toISOString(),
    };
  });
}

export async function PUT(request, { params }) {
  return responder(async () => {
    const id = idValido(params.id);
    return id ? atualizarObra(id, await lerJSON(request)) : null;
  });
}

export async function DELETE(_request, { params }) {
  return responder(async () => {
    const id = idValido(params.id);
    return id && (await excluirObra(id)) ? { ok: true } : null;
  });
}
