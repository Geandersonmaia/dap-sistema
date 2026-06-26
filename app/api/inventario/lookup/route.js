const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const codigo = searchParams.get('codigo');

  if (!codigo) {
    return Response.json({ error: 'Informe o código (?codigo=...)' }, { status: 400, headers: CORS_HEADERS });
  }

  // 1) Open Food Facts — boa cobertura para itens com EAN/UPC de fabricante
  try {
    const offRes = await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(codigo)}.json`);
    if (offRes.ok) {
      const data = await offRes.json();
      if (data.status === 1 && data.product) {
        const nome = data.product.product_name_pt || data.product.product_name || data.product.generic_name;
        if (nome) {
          return Response.json({ found: true, descricao: nome, fonte: 'Open Food Facts' }, { headers: CORS_HEADERS });
        }
      }
    }
  } catch (e) {}

  // 2) UPCitemdb — fallback para produtos em geral
  try {
    const upcRes = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(codigo)}`);
    if (upcRes.ok) {
      const data = await upcRes.json();
      if (data.code === 'OK' && data.items && data.items.length) {
        const item = data.items[0];
        const nome = item.title || item.brand;
        if (nome) {
          return Response.json({ found: true, descricao: nome, fonte: 'UPCitemdb' }, { headers: CORS_HEADERS });
        }
      }
    }
  } catch (e) {}

  return Response.json({ found: false }, { headers: CORS_HEADERS });
}
