export const FUSO = "America/Porto_Velho";

export const FUNCOES = {
  piloto: "Piloto",
  copiloto: "Copiloto",
  tripulante: "Tripulante operacional",
  medico: "Médico",
  enfermeiro: "Enfermeiro",
  mecanico: "Mecânico",
};

// Ordem em que a equipe aparece na missão
export const FUNCOES_MISSAO = ["piloto", "copiloto", "tripulante", "medico", "enfermeiro"];

// Quem pode ocupar cada vaga da missão
export const PODE_OCUPAR = {
  piloto: ["piloto"],
  copiloto: ["copiloto", "piloto"],
  tripulante: ["tripulante"],
  medico: ["medico"],
  enfermeiro: ["enfermeiro"],
};

export const TIPOS_MISSAO = [
  "Transporte aeromédico",
  "Transporte de órgãos",
  "Busca e salvamento",
  "Combate a incêndio",
  "Apoio operacional",
  "Outro",
];

export const STATUS_MEMBRO = {
  pendente: { rotulo: "Não enviado", cor: "bg-white/10 text-goa-suave" },
  enviado: { rotulo: "Aguardando", cor: "bg-goa-ambar/15 text-goa-ambar" },
  confirmado: { rotulo: "Confirmado", cor: "bg-goa-verde/15 text-emerald-300" },
  recusou: { rotulo: "Não pode", cor: "bg-goa-vermelho/20 text-red-300" },
  substituido: { rotulo: "Substituído", cor: "bg-white/5 text-goa-suave line-through" },
};

export const STATUS_MISSAO = {
  acionada: { rotulo: "Acionada", cor: "bg-goa-ambar/15 text-goa-ambar" },
  pronta: { rotulo: "Equipe pronta", cor: "bg-goa-verde/15 text-emerald-300" },
  concluida: { rotulo: "Concluída", cor: "bg-white/10 text-goa-suave" },
  cancelada: { rotulo: "Cancelada", cor: "bg-goa-vermelho/20 text-red-300" },
};

export function dataHora(valor) {
  if (!valor) return "a definir";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: FUSO,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(valor));
}

export function hora(valor) {
  if (!valor) return "";
  return new Intl.DateTimeFormat("pt-BR", { timeZone: FUSO, hour: "2-digit", minute: "2-digit" }).format(
    new Date(valor)
  );
}

// "Maria da Silva Souza" -> "M. S. S."
export function iniciais(nome) {
  if (!nome) return "";
  return nome
    .split(/\s+/)
    .filter((p) => p.length > 2 || p === p.toUpperCase())
    .map((p) => p[0].toUpperCase() + ".")
    .join(" ");
}

// Aceita "(69) 99999-1234" e devolve "5569999991234"
export function numeroWhatsApp(telefone) {
  const d = String(telefone || "").replace(/\D/g, "");
  if (!d) return "";
  return d.length <= 11 ? "55" + d : d;
}

export function nomeCompleto(p) {
  return [p.posto, p.nome].filter(Boolean).join(" ");
}
