import { DB } from "../constants";
import { queryAll } from "../queryAll";
import { getTitle, getText, getSelect, getDate } from "../normalizers";

export async function buscarImplantacoes() {
  const paginas = await queryAll(DB.IMPLANTACOES);
  return paginas.map((page) => normalizarImplantacao(page));
}

export function normalizarImplantacao(page) {
  const p = page.properties;
  return {
    id: page.id,
    objeto: getTitle(p["Objeto"]),
    status: getSelect(p["Status"]),
    situacaoImplantacao: getSelect(p["Siuação da Implantação"]),
    prioridade: getSelect(p["Prioridade"]),
    departamentoDemandante: getSelect(p["Departamento Demandante"]),
    previsaoConclusao: getDate(p["Previsão de Conclusão"]),
    dataEnvioSMCL: getDate(p["Data Envio SMCL"]),
    processoSEI: getText(p["Processo Implantação (SEI)"]),
  };
}

export function resumoImplantacoes(implantacoes) {
  const total = implantacoes.length;
  const implantacoesAndamento = implantacoes.filter((i) => i.status !== "Concluido").length;
  const implantacoesUrgentes = implantacoes.filter(
    (i) => i.status !== "Concluido" && i.prioridade === "Urgente"
  ).length;
  return { totalImplantacoes: total, implantacoesAndamento, implantacoesUrgentes };
}
