import { notion, DB, RELACAO_ATA_EM_ITENS, queryAll, getTitle, getText, getNumber, getRelationIds, getFormulaValue } from "@/lib/notion";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const busca = (searchParams.get("busca") || "").trim().toLowerCase();

    if (busca.length < 2) {
      return Response.json({ itens: [] });
    }

    const todosItens = await queryAll(DB.ITENS);

    const encontrados = todosItens.filter((page) => {
      const nome = getTitle(page.properties["Item"]).toLowerCase();
      const codigo = getText(page.properties["Código"]).toLowerCase();
      return nome.includes(busca) || codigo.includes(busca);
    });

    // Limita a 20 resultados pra não sobrecarregar a tela
    const limitados = encontrados.slice(0, 20);

    // Resolve o nome da Ata relacionada (1 fetch por ata única, não por item)
    const ataIds = new Set();
    limitados.forEach((page) => {
      getRelationIds(page.properties[RELACAO_ATA_EM_ITENS]).forEach((id) => ataIds.add(id));
    });

    const ataNomes = {};
    await Promise.all(
      Array.from(ataIds).map(async (id) => {
        try {
          const ataPage = await notion.pages.retrieve({ page_id: id });
          ataNomes[id] = getTitle(ataPage.properties["ATA"]) || "Ata sem nome";
        } catch {
          ataNomes[id] = "Ata não encontrada";
        }
      })
    );

    const itens = limitados.map((page) => {
      const props = page.properties;
      const relIds = getRelationIds(props[RELACAO_ATA_EM_ITENS]);
      return {
        item: getTitle(props["Item"]),
        codigo: getText(props["Código"]),
        unidade: getText(props["Unidade"]),
        quantidadeRegistrada: getNumber(props["Quantidade Registrada"]),
        quantidadeGerenciada: getNumber(props["Quantidade Gerenciada"]),
        saldoQuantidade: getFormulaValue(props["Saldo Quantidade"]),
        percentualConsumido: getFormulaValue(props["Percentual Consumido"]),
        situacaoItem: getFormulaValue(props["Situação do Item"]),
        situacaoPorSaldo: getFormulaValue(props["Situação por Saldo"]),
        valorUnitario: getNumber(props["Valor Unitário"]),
        valorTotalItem: getFormulaValue(props["Valor Total Item"]),
        atas: relIds.map((id) => ataNomes[id]).filter(Boolean),
      };
    });

    return Response.json({ itens, totalEncontrado: encontrados.length });
  } catch (err) {
    console.error("Erro na busca de itens:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
