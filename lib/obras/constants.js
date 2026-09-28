export const CATEGORIAS = [
  { valor: "material", curto: "Material", label: "Material", icone: "🧱" },
  { valor: "mao_de_obra", curto: "Mão de obra", label: "Mão de obra", icone: "👷" },
  { valor: "equipamento", curto: "Equip.", label: "Equipamentos", icone: "🚜" },
  { valor: "terceirizado", curto: "Terceiros", label: "Serviços terceirizados", icone: "🤝" },
  { valor: "administracao", curto: "Adm.", label: "Administração da obra", icone: "📋" },
  { valor: "impostos", curto: "Impostos", label: "Impostos e taxas", icone: "🧾" },
  { valor: "outros", curto: "Outros", label: "Outros", icone: "📦" },
];

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
