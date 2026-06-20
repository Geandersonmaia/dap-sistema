# DAP Sistema — v2 (BI Administrativo)

Reconstrução completa do sistema anterior, agora como um painel de BI com:
sidebar, header, login com Google + lista de e-mails autorizados, gráficos,
tabelas filtráveis, exportação CSV, chat de IA flutuante e PWA instalável.

---

## ⚠️ Passo 0 — Isso SUBSTITUI o projeto anterior

Esse ZIP contém uma reestruturação grande. Antes de subir os arquivos novos,
**exclua estes arquivos antigos do repositório no GitHub** (eles ficaram obsoletos
e, se não forem removidos, alguns deles passam a responder sem exigir login —
risco de segurança):

1. `app/chat/page.jsx` (pasta `app/chat` inteira)
2. `app/api/painel/route.js` (pasta `app/api/painel` inteira)
3. `app/api/itens/route.js` (pasta `app/api/itens` inteira)
4. `lib/notion.js` (o arquivo solto — não confundir com a pasta nova `lib/notion/`)

Pra excluir cada um: abra o arquivo no GitHub → ícone de lixeira (🗑) no canto
superior direito → Commit changes. Como cada pasta só tem um arquivo dentro,
a pasta desaparece sozinha ao excluir o arquivo.

Depois disso, faça **Add file → Upload files** com todo o conteúdo deste ZIP
(ele vai sobrescrever os arquivos que mudaram e adicionar os novos).

---

## Passo 1 — Configurar o login com Google

### 1.1 Criar as credenciais no Google Cloud Console
1. Acesse [console.cloud.google.com](https://console.cloud.google.com)
2. Crie um novo projeto (ou use um existente) — nome sugerido: `DAP Sistema`
3. No menu lateral: **APIs e Serviços** → **Tela de consentimento OAuth**
   - Tipo de usuário: **Externo**
   - Preencha nome do app (`DAP Sistema`), e-mail de suporte e e-mail de contato
   - Pode deixar em modo "Teste" — só funciona pra e-mails que você adicionar como "test users" nessa tela enquanto estiver em teste, então adicione lá os e-mails que vão usar o sistema
4. Ainda em APIs e Serviços → **Credenciais** → **Criar credenciais** → **ID do cliente OAuth**
   - Tipo de aplicativo: **Aplicativo da Web**
   - Nome: `DAP Sistema Web`
   - **URIs de redirecionamento autorizados**, adicione:
     ```
     https://dap-sistema.vercel.app/api/auth/callback/google
     ```
     (troque pelo seu domínio real da Vercel, se for diferente)
5. Clique em **Criar**. Vai aparecer o **Client ID** e o **Client Secret** — copie os dois.

### 1.2 Quem pode acessar
Você define isso só na variável de ambiente `ALLOWED_EMAILS` (próximo passo) —
não precisa voltar ao Google Cloud Console pra adicionar pessoas depois,
**a não ser** que o app continue em modo "Teste" no Google, caso em que cada
pessoa também precisa ser adicionada na lista de "test users" da tela de
consentimento (passo 1.1.3). Se isso for chato de manter, dá pra publicar o
app oficialmente no Google (botão "Publish app" na tela de consentimento) —
aí qualquer e-mail pode tentar logar, mas só os da `ALLOWED_EMAILS` vão
conseguir entrar de fato.

---

## Passo 2 — Variáveis de ambiente na Vercel

Em **Settings → Environment Variables** do projeto:

| Name | Value |
|---|---|
| `NOTION_TOKEN` | mesmo token da integração `dap-alerts` que você já tem (substitui o antigo `NOTION_API_KEY`) |
| `ANTHROPIC_API_KEY` | a mesma chave da Anthropic que você já criou (`dap-sistema`) |
| `AUTH_GOOGLE_ID` | o Client ID copiado no passo 1.1 |
| `AUTH_GOOGLE_SECRET` | o Client Secret copiado no passo 1.1 |
| `AUTH_SECRET` | `XWrpDae4ObjACJjNM3wv1SWyQyeye3fMB78Q4m3CwCk=` |
| `NEXTAUTH_URL` | `https://dap-sistema.vercel.app` (seu domínio real) |
| `ALLOWED_EMAILS` | lista separada por vírgula, ex: `cap.geanderson@gmail.com,outrapessoa@gmail.com` |

Se a variável `NOTION_API_KEY` antiga ainda existir, pode excluir ela depois
de confirmar que `NOTION_TOKEN` está funcionando (Vercel não deixa renomear
uma variável existente — é preciso criar uma nova com o nome certo).

Depois de salvar todas: **Deployments** → três pontinhos do último deploy → **Redeploy**.

---

## Passo 3 — Campos que ainda faltam no Notion (opcional, mas recomendado)

O sistema já funciona sem eles (os campos aparecem em branco), mas pra
aproveitar 100% do painel, crie estes campos com **exatamente** esses nomes:

**Na base LIQUIDAÇÃO - DAP:**
- `CNPJ` (tipo texto)
- `Nota Fiscal` (tipo texto)
- `Valor` (tipo número, formato moeda real)

**Na base GERENCIAMENTOS - DAP:**
- `Demandante` (tipo texto ou select)
- `Período` (tipo texto)

Assim que você criar esses campos e preencher alguns registros, o painel
passa a mostrar essa informação automaticamente — não precisa me avisar nem
mudar nada no código.

---

## Passo 4 — Testar

1. Acesse `https://dap-sistema.vercel.app`
2. Deve redirecionar pra `/login`
3. Clique em "Entrar com Google", use um e-mail que esteja em `ALLOWED_EMAILS`
4. Deve cair direto no **Painel Geral**, com sidebar, KPIs e gráficos
5. Teste as outras páginas no menu: Atas, Gerenciamentos, Liquidação, Fornecedores, Relatórios
6. Teste o botão flutuante 💬 no canto inferior direito (chat de IA)
7. Teste "Sair" no menu do usuário (canto superior direito)

---

## Estrutura do projeto

```
app/
  login/page.jsx              ← tela de login (só Google)
  painel/
    page.jsx                  ← Painel Geral (KPIs + gráficos + processos críticos)
    atas/page.jsx
    gerenciamentos/page.jsx
    liquidacoes/page.jsx
    fornecedores/page.jsx
    relatorios/page.jsx
  api/
    auth/[...nextauth]/route.js
    bi/
      overview/route.js
      atas/route.js
      gerenciamentos/route.js
      liquidacoes/route.js
      fornecedores/route.js
      itens/route.js          ← busca de item/saldo
    chat/route.js              ← usado pelo chat flutuante
lib/
  authOptions.js               ← config do Google OAuth + whitelist
  notion/
    client.js
    constants.js                ← IDs das bases
    normalizers.js               ← leitura segura de campos do Notion
    queryAll.js
    atas.js / itens.js / gerenciamentos.js / liquidacoes.js / fornecedores.js / implantacoes.js
  utils/csv.js                  ← exportação CSV
components/
  Providers.jsx
  RegistrarServiceWorker.jsx
  dashboard/
    DashboardLayout.jsx / Sidebar.jsx / Header.jsx / UserMenu.jsx
    StatCard.jsx / ChartCard.jsx / StatusBadge.jsx
    DataTable.jsx / FilterBar.jsx / SearchInput.jsx
    LoadingState.jsx / ErrorState.jsx / EmptyState.jsx / RefreshButton.jsx
    ChatWidget.jsx
hooks/
  useInactivityLogout.js        ← logout automático após 30 min sem uso
middleware.js                    ← protege /painel/** e /api/bi/** e /api/chat/**
public/
  manifest.json / sw.js / icon-192.png / icon-512.png
```

---

## Como instalar como app no celular (PWA)

### Android (Chrome)
1. Abra o link no Chrome e faça login
2. Toque no menu (⋮) → **"Instalar app"** (ou banner automático)
3. O app aparece na tela inicial, abre em tela cheia

### iPhone / iPad (Safari)
1. Abra o link no Safari e faça login
2. Toque no ícone de compartilhar (□ com seta) → **"Adicionar à Tela de Início"**
3. Confirme

### Computador (Chrome / Edge)
1. Abra o link
2. Na barra de endereços, clique no ícone de instalar (➕ ou monitor) → Instalar

---

## Observações importantes

- Campos que o documento original pedia mas não existem ainda no Notion
  (CNPJ, Nota Fiscal, Valor da liquidação, Demandante, Período) aparecem em
  branco — não travam o sistema. Veja o Passo 3 para cadastrá-los.
- "Fornecedores" não é uma base própria no Notion — é montada agregando os
  registros de Liquidação por nome de fornecedor.
- O chat de IA busca os dados das bases a cada pergunta; com o volume atual
  isso é rápido.
- Sessão expira automaticamente após 30 minutos de inatividade.
