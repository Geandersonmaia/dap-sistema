import {
  DB,
  queryAll,
  getTitle,
  getText,
  getSelect,
  getStatus,
  getDateStart,
  getNumber,
  getFormulaValue,
  getRelationIds,
} from "@/lib/notion";

const RELACAO_ATA_EM_ITENS = "ATAS VIGENTES - DAP ";

function montarMapaAtas(atas) {
  const mapa = {};
  for (const page of atas) {
    mapa[page.id] = getTitle(page.properties["ATA"]) || getText(page.properties["Objeto"]) || "Ata sem nome";
  }
  return mapa;
}

function nomesAtas(props, campo, mapaAtas) {
  return getRelationIds(props[campo])
    .map((id) => mapaAtas[id])
    .filter(Boolean);
}

async function montarContexto() {
  const [atas, itens, gerenciamentos, liquidacoes, implantacoes] = await Promise.all([
    queryAll(DB.ATAS),
    queryAll(DB.ITENS),
    queryAll(DB.GERENCIAMENTOS),
    queryAll(DB.LIQUIDACAO),
    queryAll(DB.IMPLANTACOES),
  ]);

  const mapaAtas = montarMapaAtas(atas);

  const atasResumo = atas.map((page) => {
    const p = page.properties;
    return {
      ata: getTitle(p["ATA"]),
      objeto: getText(p["Objeto"]),
      status: getSelect(p["Status (Painel)"]),
      situacaoAta: getFormulaValue(p["Situação da ATA"]),
      percentualConsumido: getFormulaValue(p["Percentual Consumido %"]),
      vigenciaFinal: getDateStart(p["Vigência Final"]),
      valorGlobalHomologado: getNumber(p["Valor Global  Homologado"]),
      valorTotalGerenciado: getFormulaValue(p["Valor Total Gerenciado"]),
      processoSEI: getText(p["Processo Implantação (SEI)"]),
    };
  });

  const itensResumo = itens.map((page) => {
    const p = page.properties;
    return {
      item: getTitle(p["Item"]),
      codigo: getText(p["Código"]),
      unidade: getText(p["Unidade"]),
      quantidadeRegistrada: getNumber(p["Quantidade Registrada"]),
      quantidadeGerenciada: getNumber(p["Quantidade Gerenciada"]),
      saldo: getFormulaValue(p["Saldo Quantidade"]),
      percentualConsumido: getFormulaValue(p["Percentual Consumido"]),
      situacao: getFormulaValue(p["Situação por Saldo"]),
      atas: nomesAtas(p, RELACAO_ATA_EM_ITENS, mapaAtas),
    };
  });

  const gerenciamentosResumo = gerenciamentos.map((page) => {
    const p = page.properties;
    return {
      objeto: getTitle(p["Objeto"]),
      status: getStatus(p["Status"]),
      dataSolicitacao: getDateStart(p["Data Solicitação"]),
      prazoInterno: getDateStart(p["Prazo Interno"]),
      dataEmpenho: getDateStart(p["Data do(s) Empenho(s)"]),
      valorEstimado: getNumber(p["Valor Estimado"]),
      ata: nomesAtas(p, "Ata ", mapaAtas),
    };
  });

  const liquidacoesResumo = liquidacoes.map((page) => {
    const p = page.properties;
    return {
      fornecedor: getTitle(p["Fornecedor"]),
      status: getStatus(p["Status"]),
      liquidacao: getStatus(p["Liquidação"]),
      entrega: getDateStart(p["Entrega"]),
      dataEnvioNE: getDateStart(p["Data Envio NE"]),
      notificacoes: getNumber(p["Notificações"]),
      ne: getText(p["NE"]),
      prazoStatus: getFormulaValue(p[""]),
      acaoRecomendada: getFormulaValue(p["Ação Recomendada"]),
      diasRestantes: getFormulaValue(p["Dias Restantes"]),
      ata: nomesAtas(p, "Ata Relacionada", mapaAtas),
    };
  });

  const implantacoesResumo = implantacoes.map((page) => {
    const p = page.properties;
    return {
      objeto: getTitle(p["Objeto"]),
      status: getSelect(p["Status"]),
      situacaoImplantacao: getSelect(p["Siuação da Implantação"]),
      prioridade: getSelect(p["Prioridade"]),
      departamentoDemandante: getSelect(p["Departamento Demandante"]),
      previsaoConclusao: getDateStart(p["Previsão de Conclusão"]),
      dataEnvioSMCL: getDateStart(p["Data Envio SMCL"]),
      processoSEI: getText(p["Processo Implantação (SEI)"]),
    };
  });

  return { atasResumo, itensResumo, gerenciamentosResumo, liquidacoesResumo, implantacoesResumo };
}

export async function POST(request) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Mensagem inválida" }, { status: 400 });
    }

    const contexto = await montarContexto();
    const hoje = new Date().toLocaleDateString("pt-BR");

    const systemPrompt = `Você é o assistente de gestão do DAP (Departamento de Almoxarifado e Patrimônio) da SEMUSA, em Porto Velho/RO.
Hoje é ${hoje}.

Responda SEMPRE em português do Brasil, de forma direta e objetiva, usando APENAS os dados fornecidos abaixo.
Se a pergunta não puder ser respondida com esses dados, diga isso claramente em vez de inventar.
Quando mencionar valores, datas ou quantidades, traga o número exato dos dados.

DADOS ATUAIS:

ATAS VIGENTES (${contexto.atasResumo.length} registros):
${JSON.stringify(contexto.atasResumo)}

ITENS DA ATA (${contexto.itensResumo.length} registros):
${JSON.stringify(contexto.itensResumo)}

GERENCIAMENTOS (${contexto.gerenciamentosResumo.length} registros):
${JSON.stringify(contexto.gerenciamentosResumo)}

LIQUIDAÇÃO (${contexto.liquidacoesResumo.length} registros):
${JSON.stringify(contexto.liquidacoesResumo)}

IMPLANTAÇÕES (${contexto.implantacoesResumo.length} registros):
${JSON.stringify(contexto.implantacoesResumo)}`;

    const mensagens = [...(Array.isArray(history) ? history : []), { role: "user", content: message }];

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: mensagens,
      }),
    });

    const data = await resp.json();

    if (data.error) {
      console.error("Erro Anthropic:", data.error);
      return Response.json({ error: data.error.message || "Erro na API da Anthropic" }, { status: 500 });
    }

    const resposta = (data.content || [])
      .filter((c) => c.type === "text")
      .map((c) => c.text)
      .join("\n")
      .trim() || "Não consegui gerar uma resposta.";

    return Response.json({ resposta });
  } catch (err) {
    console.error("Erro no chat:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
