import { criarRegistros } from "@/lib/obras/repositorio";
import { idValido, lerJSON, responder } from "@/lib/obras/api";

export const dynamic = "force-dynamic";

// POST /api/obras/:id/itens | lancamentos | medicoes  (objeto ou lista)
export async function POST(request, { params }) {
  return responder(async () => {
    const id = idValido(params.id);
    return id ? criarRegistros(id, params.recurso, await lerJSON(request)) : null;
  });
}
