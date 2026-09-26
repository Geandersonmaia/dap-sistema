import { dataHora, FUNCOES, iniciais, nomeCompleto } from "./formato";

const CLINICOS = ["medico", "enfermeiro"];

// Texto da convocação enviado a um membro da equipe.
// Dados clínicos do paciente só vão para médico e enfermeiro (LGPD).
export function mensagemConvocacao(missao, membro, equipe) {
  const clinico = CLINICOS.includes(membro.funcao);
  const linhas = [
    `*GOA/CBMRO · MISSÃO ${missao.numero}*`,
    "",
    `Olá, ${nomeCompleto(membro)}. Você foi escalado(a) como *${FUNCOES[membro.funcao] || membro.funcao}*.`,
    "",
    `*Tipo:* ${missao.tipo}`,
    `*Aeronave:* ${missao.codinome} · ${missao.matricula} (${missao.modelo})`,
    `*Apresentação/decolagem:* ${dataHora(missao.previsao)}`,
    `*Rota:* ${missao.origem || "?"} → ${missao.destino || "?"}`,
  ];
  if (missao.hospital) linhas.push(`*Hospital de destino:* ${missao.hospital}`);
  if (missao.paciente_nome || missao.paciente_idade) {
    const nome = clinico ? missao.paciente_nome : iniciais(missao.paciente_nome);
    linhas.push(`*Paciente:* ${[nome, missao.paciente_idade && missao.paciente_idade + " anos"].filter(Boolean).join(", ")}`);
  }
  if (clinico && missao.paciente_condicao) linhas.push(`*Quadro clínico:* ${missao.paciente_condicao}`);
  if (missao.observacoes) linhas.push(`*Obs.:* ${missao.observacoes}`);

  const ativos = equipe.filter((m) => m.status !== "substituido");
  if (ativos.length) {
    linhas.push("", "*Equipe:*");
    for (const m of ativos) linhas.push(`• ${FUNCOES[m.funcao] || m.funcao}: ${nomeCompleto(m)}`);
  }
  linhas.push("", "Responda *CONFIRMO* ou *NÃO POSSO*.");
  return linhas.join("\n");
}

// Texto geral da missão (para copiar em grupo ou arquivar), sem dados clínicos.
export function textoMissao(missao, equipe) {
  const linhas = [
    `*GOA/CBMRO · MISSÃO ${missao.numero}*`,
    `*Tipo:* ${missao.tipo}`,
    `*Aeronave:* ${missao.codinome} · ${missao.matricula}`,
    `*Apresentação/decolagem:* ${dataHora(missao.previsao)}`,
    `*Rota:* ${missao.origem || "?"} → ${missao.destino || "?"}`,
  ];
  if (missao.hospital) linhas.push(`*Hospital de destino:* ${missao.hospital}`);
  if (missao.paciente_nome || missao.paciente_idade) {
    linhas.push(
      `*Paciente:* ${[iniciais(missao.paciente_nome), missao.paciente_idade && missao.paciente_idade + " anos"].filter(Boolean).join(", ")}`
    );
  }
  const ativos = equipe.filter((m) => m.status !== "substituido");
  if (ativos.length) {
    linhas.push("", "*Equipe:*");
    for (const m of ativos) linhas.push(`• ${FUNCOES[m.funcao] || m.funcao}: ${nomeCompleto(m)}`);
  }
  return linhas.join("\n");
}
