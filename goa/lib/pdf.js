import { dataHora, FUNCOES, nomeCompleto } from "./formato";

// Cores do brasão do GOA
const NOITE = [7, 20, 48];
const VERMELHO = [224, 36, 43];
const DOURADO = [226, 176, 74];
const HANGAR = [96, 108, 128];
const AZUL = [31, 79, 163];
const AMARELO = [247, 209, 23];
const VERDE = [30, 154, 69];

async function carregarBrasao() {
  try {
    const blob = await (await fetch("/brasao-goa.png")).blob();
    return await new Promise((ok) => {
      const r = new FileReader();
      r.onload = () => ok(r.result);
      r.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// PDF resumido da missão (A4). Contém dados de saúde: uso restrito.
export async function gerarPdfMissao(missao, equipe) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const brasao = await carregarBrasao();
  const L = 18;
  const largura = 210 - 2 * L;

  doc.setFillColor(...NOITE);
  doc.rect(0, 0, 210, 40, "F");
  // Faixa com as cores da bandeira de Rondônia
  [AZUL, AMARELO, VERDE, VERMELHO].forEach((cor, i) => {
    doc.setFillColor(...cor);
    doc.rect(i * 52.5, 40, 52.5, 1.6, "F");
  });
  const T = brasao ? L + 32 : L;
  if (brasao) doc.addImage(brasao, "PNG", L, 6, 28, 28);
  doc.setTextColor(...DOURADO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("CBMRO · GRUPO DE OPERAÇÕES AÉREAS", T, 14);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(21);
  doc.text(`ORDEM DE MISSÃO ${missao.numero}`, T, 25);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${missao.tipo} · emitida em ${dataHora(new Date())}`, T, 32);

  let y = 54;
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
