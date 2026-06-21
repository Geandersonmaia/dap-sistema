import { buscarAtas, montarMapaAtas } from "@/lib/notion/atas";
import { buscarItens } from "@/lib/notion/itens";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = (searchParams.get("busca") || "").trim().toLowerCase();

    if (busca.length < 2) {
      return Response.json({ itens: [] });
    }

    const atas = await buscarAtas();
    const mapaAtas = montarMapaAtas(atas);
    const todosItens = await buscarItens(mapaAtas);

    const encontrados = todosItens.filter((it) => {
      return it.item.toLowerCase().includes(busca) || it.codigo.toLowerCase().includes(busca);
    });

    return Response.json({ itens: encontrados.slice(0, 30), totalEncontrado: encontrados.length });
  } catch (err) {
    console.error("Erro em /api/bi/itens:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
