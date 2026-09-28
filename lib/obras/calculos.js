// Motor de cálculo do controle de obras. Funções puras (sem banco), usadas
// tanto pela API quanto pelo relatório de reequilíbrio.
//
// Conceitos:
// - Valor do contrato (V): preço de venda, já com BDI.
// - Custo orçado (CO): custo direto previsto na planilha (quantidade × preço unitário), sem BDI.
// - Receita medida (R): soma das medições aprovadas pelo órgão.
// - Custo real (C): soma de tudo que a empresa efetivamente gastou (lançamentos).
// - Execução: R / V (percentual financeiro executado).
// - Impacto de preço de um insumo: (preço real pago − preço orçado reajustado) × quantidade.
//   É esse impacto, somado e acrescido do BDI, que sustenta o pedido de reequilíbrio.

import { CATEGORIAS, FAIXAS_MARGEM, LIMITE_ALERTA_VARIACAO, RUBRICA_APURACAO, labelCategoria } from "./constants";

const n = (v) => {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
};

const soma = (lista, fn) => lista.reduce((acc, x) => acc + n(fn(x)), 0);

const mesDe = (data) => String(data || "").slice(0, 7);

function mesesEntre(inicio, fim) {
  const meses = [];
  let [a, m] = inicio.split("-").map(Number);
  const [af, mf] = fim.split("-").map(Number);
  while (a < af || (a === af && m <= mf)) {
    meses.push(`${a}-${String(m).padStart(2, "0")}`);
    m += 1;
    if (m > 12) {
      m = 1;
      a += 1;
    }
  }
  return meses;
}

export function classificarMargem(margem) {
  if (margem === null || margem === undefined) return "sem_dados";
  if (margem < FAIXAS_MARGEM.prejuizo) return "prejuizo";
  if (margem < FAIXAS_MARGEM.atencao) return "atencao";
  return "lucro";
}

export function analisarItens(itens, lancamentos, reajuste) {
  return itens.map((item) => {
    const lancs = lancamentos.filter((l) => l.item_id === item.id);
    const qtdOrcada = n(item.quantidade);
    const puOrcado = n(item.preco_unitario);
    const puReajustado = puOrcado * (1 + reajuste);
    const valorReal = soma(lancs, (l) => l.valor_total);
    const qtdReal = soma(lancs, (l) => l.quantidade);
    const puReal = qtdReal > 0 ? valorReal / qtdReal : null;
    const variacao = puReal !== null && puOrcado > 0 ? puReal / puOrcado - 1 : null;
    const difUnit = puReal !== null ? puReal - puReajustado : 0;

    return {
      id: item.id,
      codigo: item.codigo,
      categoria: item.categoria,
      descricao: item.descricao,
      unidade: item.unidade,
      qtdOrcada,
      puOrcado,
      puReajustado,
      totalOrcado: qtdOrcada * puOrcado,
      qtdReal,
      valorReal,
      puReal,
      variacao,
      consumo: qtdOrcada > 0 ? qtdReal / qtdOrcada : null,
      // Impacto no que já foi comprado.
      impactoRealizado: difUnit * qtdReal,
      // Impacto se o preço atual se mantiver até o fim (sobre toda a quantidade orçada).
      impactoProjetado: difUnit * (qtdOrcada > 0 ? qtdOrcada : qtdReal),
      compras: lancs.length,
    };
  });
}

export function evolucaoMensal(lancamentos, medicoes) {
  const datas = [...lancamentos.map((l) => l.data), ...medicoes.map((m) => m.data)].filter(Boolean).sort();
  if (!datas.length) return [];
  const meses = mesesEntre(mesDe(datas[0]), mesDe(datas[datas.length - 1]));
  let receitaAcum = 0;
  let custoAcum = 0;
  return meses.map((mes) => {
    const receita = soma(medicoes.filter((m) => mesDe(m.data) === mes), (m) => n(m.valor) - n(m.glosa));
    const custo = soma(lancamentos.filter((l) => mesDe(l.data) === mes), (l) => l.valor_total);
    receitaAcum += receita;
    custoAcum += custo;
    return {
      mes,
      receita,
      custo,
      resultado: receita - custo,
      receitaAcum,
      custoAcum,
      resultadoAcum: receitaAcum - custoAcum,
    };
  });
}

export function analisarObra(obra, itens = [], lancamentos = [], medicoes = []) {
  const V = n(obra.valor_contrato);
  const bdi = n(obra.bdi_percent) / 100;
  const reajuste = n(obra.reajuste_percent) / 100;

  const custoOrcadoPlanilha = soma(itens, (i) => n(i.quantidade) * n(i.preco_unitario));
  // Sem planilha cadastrada, estima o custo orçado tirando o BDI do valor do contrato.
  const custoOrcado = custoOrcadoPlanilha > 0 ? custoOrcadoPlanilha : V / (1 + bdi);

  // Receita = medições + reajustes/reequilíbrios/aditivos, menos glosas.
  const receitaMedida = soma(medicoes, (m) => n(m.valor) - n(m.glosa));
  const receitaRecebida = soma(medicoes.filter((m) => m.data_pagamento), (m) => n(m.valor) - n(m.glosa));
  const custoReal = soma(lancamentos, (l) => l.valor_total);

  // Avanço físico: só medições de serviço executado (reajuste e reequilíbrio não são avanço).
  const valorExecutado = soma(medicoes.filter((m) => !m.tipo || m.tipo === "medicao"), (m) => m.valor);
  const execucao = V > 0 ? valorExecutado / V : 0;
  const resultado = receitaMedida - custoReal;
  const margem = receitaMedida > 0 ? resultado / receitaMedida : null;
  const margemOrcada = V > 0 ? (V - custoOrcado) / V : null;

  const custoOrcadoProporcional = custoOrcado * execucao;
  const desvioCusto = custoReal - custoOrcadoProporcional;

  const saldoCaixa = receitaRecebida - custoReal;

  const analiseItens = analisarItens(itens, lancamentos, reajuste);
  const custoSemVinculo = soma(lancamentos.filter((l) => !l.item_id), (l) => l.valor_total);

  // Projeção do custo final. Com planilha: o que falta comprar de cada item, ao preço
  // pago hoje (ou ao orçado reajustado, se ainda não houve compra); gastos sem vínculo
  // seguem o ritmo atual. Sem planilha: extrapola o custo pelo percentual executado.
  let custoProjetado;
  if (custoOrcadoPlanilha > 0) {
    const restanteItens = soma(analiseItens, (i) => Math.max(0, i.qtdOrcada - i.qtdReal) * (i.puReal ?? i.puReajustado));
    const restanteSemVinculo = execucao > 0 && execucao < 1 ? (custoSemVinculo / execucao) * (1 - execucao) : 0;
    custoProjetado = custoReal + restanteItens + restanteSemVinculo;
  } else {
    custoProjetado = execucao > 0 ? custoReal / execucao : custoOrcado;
  }
  const resultadoProjetado = V - custoProjetado;
  const margemProjetada = V > 0 ? resultadoProjetado / V : null;
  const itensComPreco = analiseItens.filter((i) => i.puReal !== null);
  const impactoRealizado = soma(itensComPreco, (i) => i.impactoRealizado);
  const impactoProjetado = soma(itensComPreco, (i) => i.impactoProjetado);
  const reequilibrioEstimado = impactoProjetado * (1 + bdi);

  const porCategoria = CATEGORIAS.map((c) => {
    const orcado = soma(itens.filter((i) => i.categoria === c.valor), (i) => n(i.quantidade) * n(i.preco_unitario));
    const real = soma(lancamentos.filter((l) => l.categoria === c.valor), (l) => l.valor_total);
    return {
      categoria: c.valor,
      label: c.label,
      curto: c.curto,
      orcado,
      orcadoProporcional: orcado * execucao,
      real,
      desvio: real - orcado * execucao,
    };
  }).filter((c) => c.orcado > 0 || c.real > 0);

  const alertas = [];
  if (margem !== null && margem < 0) {
    alertas.push({
      nivel: "critico",
      texto: `A obra está no prejuízo: gastou ${formatarPct(-margem)} a mais do que recebeu em medições.`,
    });
  }
  if (margemProjetada !== null && margemProjetada < 0 && execucao > 0) {
    alertas.push({
      nivel: "critico",
      texto: `Com os preços atuais, a obra termina com prejuízo estimado de ${formatarBRL(-resultadoProjetado)}.`,
    });
  }
  itensComPreco
    .filter((i) => i.variacao !== null && i.variacao >= LIMITE_ALERTA_VARIACAO)
    .sort((a, b) => b.variacao - a.variacao)
    .forEach((i) =>
      alertas.push({
        nivel: i.variacao >= 0.25 ? "critico" : "atencao",
        texto: `${i.descricao}: preço pago ${formatarPct(i.variacao)} acima do orçado (${formatarBRL(i.puReal)} contra ${formatarBRL(i.puOrcado)} por ${i.unidade || "un"}).`,
      })
    );
  analiseItens
    .filter((i) => i.consumo !== null && i.consumo > Math.max(execucao, 0) + 0.15 && i.consumo > 0.3)
    .forEach((i) =>
      alertas.push({
        nivel: "atencao",
        texto: `${i.descricao}: já consumiu ${formatarPct(i.consumo)} da quantidade orçada com ${formatarPct(execucao)} da obra medida. Excesso de consumo não é coberto por reequilíbrio — verifique perdas ou erro de quantitativo.`,
      })
    );
  if (custoReal > 0 && custoSemVinculo / custoReal > 0.3) {
    alertas.push({
      nivel: "atencao",
      texto: `${formatarPct(custoSemVinculo / custoReal)} dos custos não estão vinculados a um item do orçamento. Vincule as compras aos itens para comprovar a variação de preço.`,
    });
  }

  return {
    valorContrato: V,
    bdi,
    reajuste,
    custoOrcado,
    custoOrcadoPlanilha,
    receitaMedida,
    receitaRecebida,
    custoReal,
    execucao,
    resultado,
    margem,
    margemOrcada,
    situacao: classificarMargem(margem),
    custoOrcadoProporcional,
    desvioCusto,
    custoProjetado,
    resultadoProjetado,
    margemProjetada,
    situacaoProjetada: classificarMargem(margemProjetada),
    saldoCaixa,
    custoSemVinculo,
    impactoRealizado,
    impactoProjetado,
    // Valor estimado do pleito: impacto de preço projetado + BDI sobre ele.
    reequilibrioEstimado,
    // Como ficaria a obra se o reequilíbrio fosse concedido.
    margemComReequilibrio:
      V + Math.max(0, reequilibrioEstimado) > 0
        ? (V + Math.max(0, reequilibrioEstimado) - custoProjetado) / (V + Math.max(0, reequilibrioEstimado))
        : null,
    itens: analiseItens,
    porCategoria,
    evolucao: evolucaoMensal(lancamentos, medicoes),
    alertas,
  };
}

// ---------------------------------------------------------------------------
// Apuração do lucro da obra — critérios do Anexo I do contrato de êxito:
//   R  = receita efetivamente recebida (inclui tributos retidos, reajustes,
//        reequilíbrios, aditivos e retenções liberadas; deduz glosas)
//   T  = tributos sobre a receita (retidos na fonte + recolhidos), sem duplicidade
//   CD = custos diretos comprovados    CI = custos indiretos com rateio aceito
//   P  = máx[0; R − T − CD − CI]        H  = % de participação × P
// Custos sem documento idôneo não são deduzidos. Despesas não dedutíveis
// (juros, multas, honorários) ficam fora. Regime de caixa para a receita.
// ---------------------------------------------------------------------------

function trimestreDe(data) {
  const [a, m] = String(data).split("-").map(Number);
  return `${a}-T${Math.ceil(m / 3)}`;
}

function fimDoTrimestre(tri) {
  const [a, t] = tri.split("-T").map(Number);
  const ultimoMes = t * 3;
  const ultimoDia = new Date(Date.UTC(a, ultimoMes, 0)).getUTCDate();
  return `${a}-${String(ultimoMes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
}

function proximoTrimestre(tri) {
  const [a, t] = tri.split("-T").map(Number);
  return t === 4 ? `${a + 1}-T1` : `${a}-T${t + 1}`;
}

// N-ésimo dia útil (seg–sex) após a data. Não considera feriados.
export function diaUtilApos(dataISO, dias) {
  const d = new Date(`${dataISO}T12:00:00Z`);
  let contados = 0;
  while (contados < dias) {
    d.setUTCDate(d.getUTCDate() + 1);
    const semana = d.getUTCDay();
    if (semana !== 0 && semana !== 6) contados += 1;
  }
  return d.toISOString().slice(0, 10);
}

export function rubricaDoLancamento(l) {
  return RUBRICA_APURACAO[l.categoria] === undefined ? "CD" : RUBRICA_APURACAO[l.categoria];
}

export function apurarLucro(obra, lancamentos = [], medicoes = []) {
  const pct = n(obra.participacao_lucro_percent) / 100;

  const recebidas = medicoes.filter((m) => m.data_pagamento);
  const naoRecebidas = medicoes.filter((m) => !m.data_pagamento);
  const semDocumento = lancamentos.filter((l) => rubricaDoLancamento(l) && !String(l.documento || "").trim());
  const naoDedutiveis = lancamentos.filter((l) => rubricaDoLancamento(l) === null);
  const dedutiveis = lancamentos.filter((l) => rubricaDoLancamento(l) && String(l.documento || "").trim());
  const semPagamento = dedutiveis.filter((l) => !l.data_pagamento);

  // Custo entra na data do pagamento; sem ela, na data do lançamento.
  const dataCusto = (l) => l.data_pagamento || l.data;

  const eventos = [...recebidas.map((m) => m.data_pagamento), ...dedutiveis.map(dataCusto)].filter(Boolean).sort();

  const calcular = (ate) => {
    const rec = recebidas.filter((m) => !ate || m.data_pagamento <= ate);
    const cst = dedutiveis.filter((l) => !ate || dataCusto(l) <= ate);
    const R = soma(rec, (m) => n(m.valor) - n(m.glosa));
    const T = soma(rec, (m) => m.tributos_retidos) + soma(cst.filter((l) => rubricaDoLancamento(l) === "T"), (l) => l.valor_total);
    const CD = soma(cst.filter((l) => rubricaDoLancamento(l) === "CD"), (l) => l.valor_total);
    const CI = soma(cst.filter((l) => rubricaDoLancamento(l) === "CI"), (l) => l.valor_total);
    const resultado = R - T - CD - CI;
    const P = Math.max(0, resultado);
    return { R, T, CD, CI, resultado, P, H: pct * P };
  };

  const trimestres = [];
  if (eventos.length) {
    let tri = trimestreDe(eventos[0]);
    const ultimo = trimestreDe(eventos[eventos.length - 1]);
    for (;;) {
      const fim = fimDoTrimestre(tri);
      trimestres.push({ trimestre: tri, fim, prazoDemonstrativo: diaUtilApos(fim, 20), ...calcular(fim) });
      if (tri === ultimo) break;
      tri = proximoTrimestre(tri);
    }
  }

  return {
    participacao: pct,
    acumulado: calcular(null),
    trimestres,
    receitaNaoRecebida: soma(naoRecebidas, (m) => n(m.valor) - n(m.glosa)),
    naoRecebidas,
    semDocumento,
    naoDedutiveis,
    semPagamento,
    valorSemDocumento: soma(semDocumento, (l) => l.valor_total),
    valorNaoDedutivel: soma(naoDedutiveis, (l) => l.valor_total),
  };
}

export function formatarTrimestre(tri) {
  const [a, t] = tri.split("-T");
  return `${t}º tri/${a}`;
}

// Resumo leve para a lista de obras.
export function resumoObra(obra, analise) {
  return {
    id: obra.id,
    nome: obra.nome,
    contratante: obra.contratante,
    numero_contrato: obra.numero_contrato,
    valorContrato: analise.valorContrato,
    receitaMedida: analise.receitaMedida,
    custoReal: analise.custoReal,
    resultado: analise.resultado,
    margem: analise.margem,
    margemProjetada: analise.margemProjetada,
    situacao: analise.situacao,
    execucao: analise.execucao,
    reequilibrioEstimado: analise.reequilibrioEstimado,
  };
}

export function formatarBRL(v) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n(v));
}

export function formatarPct(v, casas = 1) {
  if (v === null || v === undefined || !Number.isFinite(Number(v))) return "—";
  return `${(Number(v) * 100).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas })}%`;
}

export function formatarNumero(v, casas = 2) {
  if (v === null || v === undefined) return "—";
  return Number(v).toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: casas });
}

export function formatarData(iso) {
  if (!iso) return "—";
  const [a, m, d] = String(iso).slice(0, 10).split("-");
  return d ? `${d}/${m}/${a}` : iso;
}

export function formatarMes(mes) {
  const nomes = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  const [a, m] = mes.split("-");
  return `${nomes[Number(m) - 1]}/${a.slice(2)}`;
}

export { labelCategoria };
