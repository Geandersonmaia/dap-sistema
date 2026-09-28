import { analisarObra, resumoObra } from "@/lib/obras/calculos";
import { criarObra, listarObras } from "@/lib/obras/repositorio";
import { lerJSON, responder } from "@/lib/obras/api";

export const dynamic = "force-dynamic";

export async function GET() {
  return responder(async () => {
    const obras = await listarObras();
    return {
      obras: obras.map((o) => resumoObra(o.obra, analisarObra(o.obra, o.itens, o.lancamentos, o.medicoes))),
      atualizadoEm: new Date().toISOString(),
    };
  });
}

export async function POST(request) {
  return responder(async () => criarObra(await lerJSON(request)));
}
