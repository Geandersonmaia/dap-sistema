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
  pendente: { rotulo: "Não enviado", cor: "bg-goa-linha text-goa-hangar" },
  enviado: { rotulo: "Aguardando", cor: "bg-amber-100 text-amber-800" },
  confirmado: { rotulo: "Confirmado", cor: "bg-emerald-100 text-emerald-800" },
  recusou: { rotulo: "Não pode", cor: "bg-red-100 text-red-800" },
  substituido: { rotulo: "Substituído", cor: "bg-goa-linha text-goa-hangar line-through" },
};

export const STATUS_MISSAO = {
  acionada: { rotulo: "Acionada", cor: "bg-amber-100 text-amber-800" },
  pronta: { rotulo: "Equipe pronta", cor: "bg-emerald-100 text-emerald-800" },
  concluida: { rotulo: "Concluída", cor: "bg-goa-linha text-goa-hangar" },
  cancelada: { rotulo: "Cancelada", cor: "bg-red-100 text-red-800" },
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
