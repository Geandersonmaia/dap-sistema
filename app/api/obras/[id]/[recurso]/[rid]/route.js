import { atualizarRegistro, excluirRegistro } from "@/lib/obras/repositorio";
import { idValido, lerJSON, responder } from "@/lib/obras/api";

export const dynamic = "force-dynamic";

export async function PUT(request, { params }) {
  return responder(async () => {
    const id = idValido(params.id);
    const rid = idValido(params.rid);
    return id && rid ? atualizarRegistro(id, params.recurso, rid, await lerJSON(request)) : null;
  });
}

export async function DELETE(_request, { params }) {
  return responder(async () => {
    const id = idValido(params.id);
    const rid = idValido(params.rid);
    return id && rid && (await excluirRegistro(id, params.recurso, rid)) ? { ok: true } : null;
  });
}
