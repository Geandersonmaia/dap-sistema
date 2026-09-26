# GOA · Missões

App de celular para o chefe de operações do Grupamento de Operações Aéreas (GOA/CBMRO)
acionar uma missão, convocar a equipe pelo WhatsApp e acompanhar quem confirmou.

## O que a versão 0.1 faz

- **Painel**: situação das aeronaves (RESGATE 01, 03 e 04) e missões em andamento, com barra de confirmações.
- **Nova missão**: aeronave, rota, hospital, horário, equipe (piloto, copiloto, tripulante, médico, enfermeiro)
  e paciente. Todos os campos de texto têm botão de ditado por voz.
- **Convocação**: um botão por pessoa abre o WhatsApp com a mensagem pronta.
  Dados clínicos só vão para médico e enfermeiro; os demais recebem apenas as iniciais do paciente.
- **Acompanhamento**: marcar "Confirmou" / "Não pode", trocar a pessoa e reenviar.
  A missão vira "Equipe pronta" quando todos confirmam.
- **PDF** da ordem de missão e texto para copiar.
- **Equipe**: cadastro de pessoas (funções, órgão, WhatsApp) e situação das aeronaves.
- Tabela `eventos` registra cada passo, para medir o tempo economizado.

## Paleta

| Nome | Hex | Uso |
|---|---|---|
| Noite | `#0E2238` | Cabeçalho, cartão da missão (céu noturno / cabine) |
| Vermelho bombeiro | `#C8102E` | Ações principais |
| Dourado brasão | `#D4A537` | Codinomes e destaques |
| Fuselagem | `#F4F6F8` | Fundo |
| Hangar | `#5B6770` | Texto secundário |
| Verde | `#2E8B57` | Confirmado / disponível |
| Âmbar | `#D99A00` | Aguardando / manutenção |

Aproximação feita sem acesso ao Manual de Identidade Visual do CBMRO; ajustar pelos valores oficiais.

## Rodar

```bash
cp .env.example .env.local   # preencher DATABASE_URL (Neon, projeto goa-cbmro), GOA_PIN e GOA_SESSION_TOKEN
npm install
npm run dev
```

Esquema do banco: `db/schema.sql`.

## Próximos passos

1. WhatsApp oficial (Meta Cloud API): envio automático e botões "Confirmo" / "Não posso" atualizando o painel sozinhos.
2. Ditado da missão inteira com IA preenchendo os campos.
3. Anexos (prontuário e fotos) em armazenamento privado.
4. Login individual por usuário.
