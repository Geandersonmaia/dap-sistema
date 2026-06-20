import { buscarAtas, montarMapaAtas } from "@/lib/notion/atas";
import { buscarItens } from "@/lib/notion/itens";
import { buscarGerenciamentos } from "@/lib/notion/gerenciamentos";
import { buscarLiquidacoes } from "@/lib/notion/liquidacoes";
import { montarFornecedores } from "@/lib/notion/fornecedores";

export const dynamic = "force-dynamic";

async function montarContexto() {
  const atas = await buscarAtas();
  const mapaAtas = montarMapaAtas(atas);
  const [itens, gerenciamentos, liquidacoes] = await Promise.all([
    buscarItens(mapaAtas),
    buscarGerenciamentos(mapaAtas),
    buscarLiquidacoes(mapaAtas),
  ]);
  const fornecedores = montarFornecedores(liquidacoes);

  return { atas, itens, gerenciamentos, liquidacoes, fornecedores };
}

export async function POST(request) {
  try {
    const { message, history } = await request.json();

    if (!message || typeof message !== "string") {
      return Response.json({ error: "Mensagem inválida" }, { status: 400 });
    }

    const contexto = await montarContexto();
    const hoje = new Date().toLocaleDateString("pt-BR");

    const systemPrompt = `Você é o assistente de gestão do DAP (Departamento de Almoxarifado e Patrimônio) da SEMUSA, em Porto Velho/RO.
Hoje é ${hoje}.

Responda SEMPRE em português do Brasil, de forma direta e objetiva, usando APENAS os dados fornecidos abaixo.
Se a pergunta não puder ser respondida com esses dados, diga isso claramente em vez de inventar.
Alguns campos (CNPJ, Nota Fiscal, Valor de liquidação) ainda não foram cadastrados no Notion e podem aparecer vazios — avise o usuário se a informação pedida depender de um campo assim.

DADOS ATUAIS:

ATAS (${contexto.atas.length} registros):
${JSON.stringify(contexto.atas)}

ITENS DA ATA (${contexto.itens.length} registros):
${JSON.stringify(contexto.itens)}

GERENCIAMENTOS (${contexto.gerenciamentos.length} registros):
${JSON.stringify(contexto.gerenciamentos)}

LIQUIDAÇÃO (${contexto.liquidacoes.length} registros):
${JSON.stringify(contexto.liquidacoes)}

FORNECEDORES (agregado, ${contexto.fornecedores.length} registros):
${JSON.stringify(contexto.fornecedores)}`;

    const mensagens = [...(Array.isArray(history) ? history : []), { role: "user", content: message }];

    const resp = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1024,
        system: systemPrompt,
        messages: mensagens,
      }),
    });

    const data = await resp.json();

    if (data.error) {
      console.error("Erro Anthropic:", data.error);
      return Response.json({ error: data.error.message || "Erro na API da Anthropic" }, { status: 500 });
    }

    const resposta =
      (data.content || [])
        .filter((c) => c.type === "text")
        .map((c) => c.text)
        .join("\n")
        .trim() || "Não consegui gerar uma resposta.";

    return Response.json({ resposta });
  } catch (err) {
    console.error("Erro no chat:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
