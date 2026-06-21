import { buscarAtas, montarMapaAtas } from "@/lib/notion/atas";
import { buscarGerenciamentos, resumoGerenciamentos } from "@/lib/notion/gerenciamentos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const atas = await buscarAtas();
    const mapaAtas = montarMapaAtas(atas);
    const gerenciamentos = await buscarGerenciamentos(mapaAtas);

    return Response.json({
      atualizadoEm: new Date().toISOString(),
      resumo: resumoGerenciamentos(gerenciamentos),
      gerenciamentos,
    });
  } catch (err) {
    console.error("Erro em /api/bi/gerenciamentos:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
