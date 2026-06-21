import { buscarAtas, montarMapaAtas, resumoAtas } from "@/lib/notion/atas";
import { buscarGerenciamentos, resumoGerenciamentos } from "@/lib/notion/gerenciamentos";
import { buscarLiquidacoes, resumoLiquidacoes } from "@/lib/notion/liquidacoes";
import { buscarImplantacoes, resumoImplantacoes } from "@/lib/notion/implantacoes";
import { montarFornecedores, rankingsFornecedores } from "@/lib/notion/fornecedores";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const atas = await buscarAtas();
    const mapaAtas = montarMapaAtas(atas);
    const [gerenciamentos, liquidacoes, implantacoes] = await Promise.all([
      buscarGerenciamentos(mapaAtas),
      buscarLiquidacoes(mapaAtas),
      buscarImplantacoes(),
    ]);

    const fornecedores = montarFornecedores(liquidacoes);
    const rankings = rankingsFornecedores(fornecedores);

    const kpis = {
      ...resumoAtas(atas),
      ...resumoLiquidacoes(liquidacoes),
      ...resumoGerenciamentos(gerenciamentos),
      ...resumoImplantacoes(implantacoes),
    };

    // ---------- Gráfico: status de liquidação ----------
    const contagemStatus = {};
    for (const l of liquidacoes) {
      const s = l.status || "Sem status";
      contagemStatus[s] = (contagemStatus[s] || 0) + 1;
    }
    const statusLiquidacao = Object.entries(contagemStatus).map(([status, total]) => ({ status, total }));

    // ---------- Gráfico: fornecedores com mais pendências ----------
    const fornecedoresPendencias = rankings.maisPendencias.map((f) => ({
      fornecedor: f.fornecedor,
      pendencias: f.quantidadePendencias,
    }));

    // ---------- Gráfico: atas por percentual consumido ----------
    const atasPercentualConsumido = atas
      .filter((a) => typeof a.percentualConsumido === "number")
      .sort((a, b) => b.percentualConsumido - a.percentualConsumido)
      .slice(0, 8)
      .map((a) => ({
        ata: a.ata,
        percentual: a.percentualConsumido <= 1 ? a.percentualConsumido * 100 : a.percentualConsumido,
      }));

    // ---------- Linha do tempo de vencimentos (próximos 6 meses) ----------
    const timeline = {};
    const hoje = new Date();
    for (let i = 0; i < 6; i++) {
      const d = new Date(hoje.getFullYear(), hoje.getMonth() + i, 1);
      const chave = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      timeline[chave] = 0;
    }
    for (const a of atas) {
      if (!a.vigenciaFinal) continue;
      const d = new Date(a.vigenciaFinal);
      const chave = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
      if (chave in timeline) timeline[chave]++;
    }
    const timelineVencimentos = Object.entries(timeline).map(([mes, quantidade]) => ({ mes, quantidade }));

    // ---------- Processos críticos (tabela resumida) ----------
    const processosCriticos = [];

    for (const a of atas) {
      if (a.diasParaVencer !== null && a.diasParaVencer <= 30 && a.statusPainel !== "🔴 Encerrada") {
        processosCriticos.push({
          tipo: "Ata vencendo",
          referencia: a.ata,
          detalhe:
            a.diasParaVencer < 0
              ? `Venceu há ${Math.abs(a.diasParaVencer)} dia(s)`
              : `Vence em ${a.diasParaVencer} dia(s)`,
          urgencia: a.diasParaVencer <= 0 ? 1 : 2,
        });
      }
    }

    for (const l of liquidacoes) {
      if (l.finalizado) continue;
      if (typeof l.prazoStatus === "string" && l.prazoStatus.includes("Vencido")) {
        processosCriticos.push({
          tipo: "Liquidação vencida",
          referencia: l.fornecedor,
          detalhe: l.acaoRecomendada || "Notificar fornecedor",
          urgencia: 1,
        });
      } else if (typeof l.prazoStatus === "string" && l.prazoStatus.includes("Vence em Breve")) {
        processosCriticos.push({
          tipo: "Liquidação — prazo próximo",
          referencia: l.fornecedor,
          detalhe: l.diasRestantes != null ? `Vence em ${l.diasRestantes} dia(s)` : "Vence em breve",
          urgencia: 2,
        });
      }
    }

    processosCriticos.sort((a, b) => a.urgencia - b.urgencia);

    return Response.json({
      atualizadoEm: new Date().toISOString(),
      kpis,
      graficos: { statusLiquidacao, fornecedoresPendencias, atasPercentualConsumido, timelineVencimentos },
      processosCriticos: processosCriticos.slice(0, 30),
    });
  } catch (err) {
    console.error("Erro no overview:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
