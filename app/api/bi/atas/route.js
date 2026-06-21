import { buscarAtas, resumoAtas } from "@/lib/notion/atas";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const atas = await buscarAtas();
    return Response.json({
      atualizadoEm: new Date().toISOString(),
      resumo: resumoAtas(atas),
      atas,
    });
  } catch (err) {
    console.error("Erro em /api/bi/atas:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
