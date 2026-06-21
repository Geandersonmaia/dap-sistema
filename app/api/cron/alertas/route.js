import { buscarAtas, montarMapaAtas } from "@/lib/notion/atas";
import { buscarLiquidacoes } from "@/lib/notion/liquidacoes";

export const dynamic = "force-dynamic";

export async function GET(request) {
  // Proteção por chave secreta
  const auth = request.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const atas = await buscarAtas();
    const mapaAtas = montarMapaAtas(atas);
    const liquidacoes = await buscarLiquidacoes(mapaAtas);

    // ---------- Alertas de ATAS (reimplantação) ----------
    const alertasAtas = [];
    for (const a of atas) {
      const dias = a.diasParaVencer;
      const consumo = typeof a.percentualConsumido === "number"
        ? (a.percentualConsumido <= 1 ? a.percentualConsumido * 100 : a.percentualConsumido)
        : null;

      let nivel = null;
      if (dias !== null && dias >= 0) {
        if (dias <= 30) nivel = "🚨 Reimplantação URGENTE (até 30 dias)";
        else if (dias <= 60) nivel = "🟠 Reimplantação crítica (até 60 dias)";
        else if (dias <= 180) nivel = "🟡 Iniciar reimplantação (até 180 dias)";
      }
      // consumo acima de 50% também dispara
      if (!nivel && consumo !== null && consumo > 50) {
        nivel = "🟡 Consumo acima de 50%";
      }

      if (nivel) {
        alertasAtas.push({
          ata: a.ata,
          nivel,
          dias,
          consumo: consumo !== null ? Math.round(consumo) : null,
        });
      }
    }

    // ---------- Alertas de LIQUIDAÇÕES ----------
    const alertasLiquidacoes = [];
    for (const l of liquidacoes) {
      if (l.finalizado) continue;
      const venceBreve = typeof l.prazoStatus === "string" && l.prazoStatus.includes("Vence em Breve");
      const notificar = typeof l.acaoRecomendada === "string" && l.acaoRecomendada.toLowerCase().includes("notificar");
      if (venceBreve || notificar) {
        alertasLiquidacoes.push({
          fornecedor: l.fornecedor,
          diasRestantes: l.diasRestantes ?? null,
          acao: l.acaoRecomendada || "Notificar fornecedor",
        });
      }
    }

    return Response.json({
      geradoEm: new Date().toISOString(),
      alertasAtas,
      alertasLiquidacoes,
    });
  } catch (err) {
    console.error("Erro nos alertas:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
