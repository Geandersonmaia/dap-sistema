import { dataHora, FUNCOES, nomeCompleto } from "./formato";

const NOITE = [14, 34, 56];
const VERMELHO = [200, 16, 46];
const DOURADO = [212, 165, 55];
const HANGAR = [91, 103, 112];

// PDF resumido da missão (A4). Contém dados de saúde: uso restrito.
export async function gerarPdfMissao(missao, equipe) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const L = 18;
  const largura = 210 - 2 * L;

  doc.setFillColor(...NOITE);
  doc.rect(0, 0, 210, 38, "F");
  doc.setFillColor(...VERMELHO);
  doc.rect(0, 38, 210, 1.6, "F");
  doc.setTextColor(...DOURADO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("CORPO DE BOMBEIROS MILITAR DE RONDÔNIA · GRUPAMENTO DE OPERAÇÕES AÉREAS", L, 13);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.text(`ORDEM DE MISSÃO ${missao.numero}`, L, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${missao.tipo} · emitida em ${dataHora(new Date())}`, L, 32);

  let y = 52;
  const secao = (titulo) => {
    doc.setTextColor(...VERMELHO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(titulo.toUpperCase(), L, y);
    doc.setDrawColor(220, 225, 230);
    doc.line(L, y + 1.8, L + largura, y + 1.8);
    y += 8;
  };
  const linha = (rotulo, valor) => {
    if (!valor) return;
    doc.setTextColor(...HANGAR);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(rotulo, L, y);
    doc.setTextColor(...NOITE);
    doc.setFontSize(11);
    const partes = doc.splitTextToSize(String(valor), largura - 48);
    doc.text(partes, L + 48, y);
    y += Math.max(7, partes.length * 5.2 + 2);
  };

  secao("Aeronave e rota");
  linha("Aeronave", `${missao.codinome} · ${missao.matricula}`);
  linha("Modelo", missao.modelo);
  linha("Origem", missao.origem);
  linha("Destino", missao.destino);
  linha("Hospital de destino", missao.hospital);
  linha("Apresentação/decolagem", dataHora(missao.previsao));
  y += 3;

  secao("Equipe");
  const ativos = equipe.filter((m) => m.status !== "substituido");
  for (const m of ativos) {
    linha(FUNCOES[m.funcao] || m.funcao, `${nomeCompleto(m)}${m.status === "confirmado" ? "  (confirmado)" : ""}`);
  }
  y += 3;

  if (missao.paciente_nome || missao.paciente_condicao) {
    secao("Paciente");
    linha("Nome", missao.paciente_nome);
    linha("Idade", missao.paciente_idade && `${missao.paciente_idade} anos`);
    linha("Quadro clínico", missao.paciente_condicao);
    y += 3;
  }
  if (missao.observacoes) {
    secao("Observações");
    linha("Obs.", missao.observacoes);
  }

  doc.setTextColor(...HANGAR);
  doc.setFontSize(8);
  doc.text("Documento de uso restrito. Contém dados de saúde protegidos pela LGPD (Lei 13.709/2018).", L, 285);

  doc.save(`missao-${missao.numero.replace("/", "-")}.pdf`);
}
