import { buscarAtas, montarMapaAtas } from "@/lib/notion/atas";
import { buscarLiquidacoes, resumoLiquidacoes } from "@/lib/notion/liquidacoes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const atas = await buscarAtas();
    const mapaAtas = montarMapaAtas(atas);
    const liquidacoes = await buscarLiquidacoes(mapaAtas);

    return Response.json({
      atualizadoEm: new Date().toISOString(),
      resumo: resumoLiquidacoes(liquidacoes),
      liquidacoes,
    });
  } catch (err) {
    console.error("Erro em /api/bi/liquidacoes:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
