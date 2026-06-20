# Sistema DAP — Painel de Controle + Consulta Inteligente

Duas páginas:
- `/painel` — KPIs, alertas do dia e busca de item/saldo
- `/chat` — chat de IA que responde perguntas sobre atas, itens, gerenciamentos, liquidações e implantações

---

## Como publicar (passo a passo)

### Pré-requisitos
- Conta no [GitHub](https://github.com)
- Conta na [Vercel](https://vercel.com)
- Token de integração interna do Notion (Settings → Connections → seu integration token)
- Chave de API da Anthropic em [console.anthropic.com](https://console.anthropic.com) → API Keys

### Passo 1 — Criar o repositório no GitHub
1. Acesse github.com e clique no **"+"** no canto superior direito → **New repository**
2. Nome: `dap-sistema` (ou o nome que preferir)
3. Deixe **Public** ou **Private**, como preferir → **Create repository**
4. Na tela seguinte, clique em **"uploading an existing file"**
5. Extraia este ZIP e arraste TODOS os arquivos e pastas (mantendo a estrutura) pra área de upload
6. Role até o final e clique em **"Commit changes"**

### Passo 2 — Publicar na Vercel
1. Acesse vercel.com e faça login com sua conta GitHub
2. Clique em **"Add New..."** → **"Project"**
3. Selecione o repositório que você acabou de criar
4. A Vercel detecta Next.js automaticamente — não precisa mudar nada
5. **Antes de clicar em Deploy**, adicione as variáveis de ambiente (próximo passo)

### Passo 3 — Adicionar as chaves (OBRIGATÓRIO)
Ainda na tela de criação do projeto (ou depois em Settings → Environment Variables):

| Name | Value |
|---|---|
| `NOTION_API_KEY` | seu token de integração do Notion |
| `ANTHROPIC_API_KEY` | sua chave da Anthropic (começa com `sk-ant-...`) |

Marque todos os ambientes (Production, Preview, Development) para cada uma. Depois clique em **Deploy**.

Se você já tinha feito o deploy antes de adicionar as variáveis: vá em **Deployments** → três pontinhos do último deploy → **Redeploy**.

### Passo 4 — Conectar o Notion à integração
No Notion, abra cada uma das 5 bases (Atas Vigentes, Itens da Ata, Gerenciamentos, Liquidação, Implantações) e em "..." → **Connections**, adicione a integração que gerou o token usado em `NOTION_API_KEY`. Sem isso, a API do Notion nega o acesso mesmo com o token certo.

### Passo 5 — Acessar
Você vai receber um link assim:
```
https://dap-sistema.vercel.app
```
A partir dele, `/painel` e `/chat` já funcionam.

---

## Estrutura do projeto
```
dap-sistema/
├── app/
│   ├── layout.js
│   ├── page.js              ← Página inicial com os 2 links
│   ├── globals.css
│   ├── painel/page.jsx       ← Módulo 1: KPIs + alertas + busca de item
│   ├── chat/page.jsx         ← Módulo 2: chat de IA
│   └── api/
│       ├── painel/route.js
│       ├── itens/route.js
│       └── chat/route.js
├── lib/
│   └── notion.js             ← Cliente Notion + IDs das bases (compartilhado)
├── package.json
├── next.config.js
├── tailwind.config.js
└── postcss.config.js
```

## Observações importantes
- O chat (`/api/chat`) busca os dados das 5 bases do Notion **a cada pergunta**. Com o volume atual de dados isso é rápido; se um dia o volume crescer muito, dá pra otimizar com cache.
- Nenhuma chave de API fica exposta no navegador — tudo roda nas rotas `/api/*`, do lado do servidor.
- Não há proteção por senha nesta versão. Se quiser restringir o acesso, é uma adição simples — só avisar.
