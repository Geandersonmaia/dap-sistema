import { buscarImplantacoes, resumoImplantacoes } from "@/lib/notion/implantacoes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const implantacoes = await buscarImplantacoes();
    const resumo = resumoImplantacoes(implantacoes);
    return Response.json({
      atualizadoEm: new Date().toISOString(),
      resumo,
      implantacoes,
    });
  } catch (err) {
    console.error("Erro nas implantações:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
