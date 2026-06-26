const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

const DATABASE_ID = '5ac54ace-794b-4626-8b9c-e51d7f853bcf'; // CONTAGEM DE INVENTÁRIO - SCANNER (DAP)

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET() {
  return Response.json({ status: 'online' }, { headers: CORS_HEADERS });
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { frente, setor, codigo, descricao, quantidade, estado, responsavel } = body;

    if (!frente || !setor || !codigo || !responsavel) {
      return Response.json(
        { error: 'Campos obrigatórios faltando (frente, setor, codigo, responsavel).' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const titleText = descricao ? `${codigo} — ${descricao}` : String(codigo);

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: DATABASE_ID },
        properties: {
          Item: { title: [{ text: { content: titleText } }] },
          Frente: { select: { name: frente } },
          Setor: { rich_text: [{ text: { content: String(setor) } }] },
          Código: { rich_text: [{ text: { content: String(codigo) } }] },
          Descrição: { rich_text: [{ text: { content: String(descricao || '') } }] },
          Quantidade: { number: Number(quantidade) || 0 },
          Estado: { select: { name: estado || 'N/A' } },
          Responsável: { rich_text: [{ text: { content: String(responsavel) } }] },
        },
      }),
    });

    if (!notionRes.ok) {
      const errData = await notionRes.json().catch(() => ({}));
      return Response.json(
        { error: 'Erro ao gravar no Notion', details: errData },
        { status: 502, headers: CORS_HEADERS }
      );
    }

    return Response.json({ ok: true }, { headers: CORS_HEADERS });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: CORS_HEADERS });
  }
}
