import {
  DB,
  queryAll,
  getTitle,
  getText,
  getSelect,
  getStatus,
  getDateStart,
  getFormulaValue,
  diasAPartirDeHoje,
} from "@/lib/notion";

const GERENC_FINALIZADOS = ["Empenhado", "Encaminhado para Pagamento"];
const LIQ_FINALIZADOS = ["Encaminhado para Pagamento", "Liquidado"];

export async function GET() {
  try {
    const [atas, gerenciamentos, liquidacoes, implantacoes] = await Promise.all([
      queryAll(DB.ATAS),
      queryAll(DB.GERENCIAMENTOS),
      queryAll(DB.LIQUIDACAO),
      queryAll(DB.IMPLANTACOES),
    ]);

    const alertas = [];

    // ---------- ATAS VIGENTES ----------
    const porStatusAta = { "🟢 Ativa": 0, "🟡 Saldo Baixo": 0, "🟠 Em Reimplantação": 0, "🔴 Encerrada": 0 };

    for (const page of atas) {
      const props = page.properties;
      const nomeAta = getTitle(props["ATA"]) || getText(props["Objeto"]) || "Ata sem nome";
      const statusPainel = getSelect(props["Status (Painel)"]);
      const vigenciaFinal = getDateStart(props["Vigência Final"]);

      if (statusPainel && porStatusAta[statusPainel] !== undefined) {
        porStatusAta[statusPainel]++;
      }

      if (vigenciaFinal && statusPainel !== "🔴 Encerrada") {
        const dias = diasAPartirDeHoje(vigenciaFinal);
        if (dias !== null && dias <= 90) {
          alertas.push({
            tipo: "Ata vencendo",
            titulo: nomeAta,
            detalhe:
              dias < 0
                ? `Vigência venceu há ${Math.abs(dias)} dia(s)`
                : dias === 0
                ? "Vigência vence hoje"
                : `Vigência final em ${dias} dia(s)`,
            urgencia: dias <= 0 ? 1 : dias <= 30 ? 2 : 3,
            origem: "Atas Vigentes",
          });
        }
      }

      if (statusPainel === "🟠 Em Reimplantação") {
        alertas.push({
          tipo: "Reimplantação necessária",
          titulo: nomeAta,
          detalhe: "Saldo crítico — iniciar processo de reimplantação",
          urgencia: 2,
          origem: "Atas Vigentes",
        });
      }
    }

    // ---------- GERENCIAMENTOS ----------
    let gerenciamentosAtivos = 0;

    for (const page of gerenciamentos) {
      const props = page.properties;
      const status = getStatus(props["Status"]);
      const objeto = getTitle(props["Objeto"]);
      const prazoInterno = getDateStart(props["Prazo Interno"]);

      if (!GERENC_FINALIZADOS.includes(status)) {
        gerenciamentosAtivos++;

        if (prazoInterno) {
          const dias = diasAPartirDeHoje(prazoInterno);
          if (dias !== null && dias <= 0) {
            alertas.push({
              tipo: "Gerenciamento atrasado",
              titulo: objeto,
              detalhe: `Prazo interno vencido há ${Math.abs(dias)} dia(s) (status: ${status || "—"})`,
              urgencia: 2,
              origem: "Gerenciamentos",
            });
          } else if (dias !== null && dias <= 7) {
            alertas.push({
              tipo: "Gerenciamento — prazo próximo",
              titulo: objeto,
              detalhe: `Prazo interno em ${dias} dia(s) (status: ${status || "—"})`,
              urgencia: 3,
              origem: "Gerenciamentos",
            });
          }
        }
      }
    }

    // ---------- LIQUIDAÇÃO ----------
    let liquidacoesPendentes = 0;

    for (const page of liquidacoes) {
      const props = page.properties;
      const fornecedor = getTitle(props["Fornecedor"]);
      const status = getStatus(props["Status"]);
      const prazoStatus = getFormulaValue(props[""]);
      const acaoRecomendada = getFormulaValue(props["Ação Recomendada"]);
      const diasRestantes = getFormulaValue(props["Dias Restantes"]);

      if (!LIQ_FINALIZADOS.includes(status)) {
        liquidacoesPendentes++;

        if (typeof prazoStatus === "string" && prazoStatus.includes("Vencido")) {
          alertas.push({
            tipo: "Liquidação vencida",
            titulo: fornecedor,
            detalhe: acaoRecomendada || "Notificar fornecedor / avaliar penalidade",
            urgencia: 1,
            origem: "Liquidação",
          });
        } else if (typeof prazoStatus === "string" && prazoStatus.includes("Vence em Breve")) {
          alertas.push({
            tipo: "Liquidação — prazo próximo",
            titulo: fornecedor,
            detalhe: diasRestantes != null ? `Vence em ${diasRestantes} dia(s)` : "Vence em breve",
            urgencia: 2,
            origem: "Liquidação",
          });
        }
      }
    }

    // ---------- IMPLANTAÇÕES ----------
    let implantacoesAndamento = 0;

    for (const page of implantacoes) {
      const props = page.properties;
      const objeto = getTitle(props["Objeto"]);
      const status = getSelect(props["Status"]);
      const prioridade = getSelect(props["Prioridade"]);

      if (status !== "Concluido") {
        implantacoesAndamento++;

        if (prioridade === "Urgente") {
          alertas.push({
            tipo: "Implantação urgente",
            titulo: objeto,
            detalhe: `Etapa atual: ${status || "—"}`,
            urgencia: 1,
            origem: "Implantações",
          });
        }
      }
    }

    alertas.sort((a, b) => a.urgencia - b.urgencia);

    return Response.json({
      atualizadoEm: new Date().toISOString(),
      kpis: {
        atasVigentes: { total: atas.length, porStatus: porStatusAta },
        gerenciamentosAtivos,
        liquidacoesPendentes,
        implantacoesAndamento,
      },
      alertas,
    });
  } catch (err) {
    console.error("Erro no painel:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
