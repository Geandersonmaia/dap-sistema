import { buscarAtas, montarMapaAtas } from "@/lib/notion/atas";
import { buscarLiquidacoes } from "@/lib/notion/liquidacoes";
import { montarFornecedores, rankingsFornecedores } from "@/lib/notion/fornecedores";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const atas = await buscarAtas();
    const mapaAtas = montarMapaAtas(atas);
    const liquidacoes = await buscarLiquidacoes(mapaAtas);
    const fornecedores = montarFornecedores(liquidacoes);

    return Response.json({
      atualizadoEm: new Date().toISOString(),
      fornecedores,
      rankings: rankingsFornecedores(fornecedores),
    });
  } catch (err) {
    console.error("Erro em /api/bi/fornecedores:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
