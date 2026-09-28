export const CATEGORIAS = [
  { valor: "material", curto: "Material", label: "Material", icone: "🧱" },
  { valor: "mao_de_obra", curto: "Mão de obra", label: "Mão de obra", icone: "👷" },
  { valor: "equipamento", curto: "Equip.", label: "Equipamentos", icone: "🚜" },
  { valor: "terceirizado", curto: "Terceiros", label: "Serviços terceirizados", icone: "🤝" },
  { valor: "administracao", curto: "Adm.", label: "Administração da obra", icone: "📋" },
  { valor: "impostos", curto: "Tributos", label: "Tributos sobre a receita", icone: "🧾" },
  { valor: "indireto", curto: "Indiretos", label: "Custos indiretos (rateio aceito por escrito)", icone: "🏢" },
  { valor: "nao_dedutivel", curto: "Não dedut.", label: "Não dedutível (juros, multas, honorários)", icone: "🚫" },
  { valor: "outros", curto: "Outros", label: "Outros custos da obra (fretes, seguros, canteiro)", icone: "📦" },
];

// Como cada categoria entra na apuração do lucro (Anexo I): P = máx[0; R − T − CD − CI].
export const RUBRICA_APURACAO = {
  material: "CD",
  mao_de_obra: "CD",
  equipamento: "CD",
  terceirizado: "CD",
  administracao: "CD",
  outros: "CD",
  impostos: "T",
  indireto: "CI",
  nao_dedutivel: null,
};

export const TIPOS_RECEITA = [
  { valor: "medicao", label: "Medição" },
  { valor: "reajuste", label: "Reajuste" },
  { valor: "reequilibrio", label: "Reequilíbrio" },
  { valor: "aditivo", label: "Aditivo" },
  { valor: "retencao_liberada", label: "Retenção contratual liberada" },
];

export const TIPO_RECEITA_LABEL = Object.fromEntries(TIPOS_RECEITA.map((t) => [t.valor, t.label]));

export const CATEGORIA_LABEL = Object.fromEntries(CATEGORIAS.map((c) => [c.valor, c.label]));

export function labelCategoria(valor) {
  return CATEGORIA_LABEL[valor] || valor || "—";
}

// Faixas do lucrômetro (margem sobre o que já foi medido).
export const FAIXAS_MARGEM = {
  prejuizo: 0, // abaixo de 0% → prejuízo
  atencao: 0.05, // entre 0% e 5% → margem apertada
};

// Variação de preço de insumo acima disso vira alerta.
export const LIMITE_ALERTA_VARIACAO = 0.1;
