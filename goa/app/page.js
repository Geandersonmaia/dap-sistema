import Link from "next/link";
import Moldura from "@/components/Moldura";
import { sql } from "@/lib/db";
import { dataHora, STATUS_MISSAO } from "@/lib/formato";

export const dynamic = "force-dynamic";

const SITUACAO = {
  disponivel: { rotulo: "Disponível", cor: "bg-emerald-500" },
  manutencao: { rotulo: "Manutenção", cor: "bg-goa-ambar" },
  indisponivel: { rotulo: "Indisponível", cor: "bg-goa-vermelho" },
};

export default async function Painel() {
  const [aeronaves, missoes] = await Promise.all([
    sql`select * from aeronaves order by codinome`,
    sql`
      select m.id, m.numero, m.tipo, m.origem, m.destino, m.previsao, m.status,
             a.codinome,
             count(e.id) filter (where e.status <> 'substituido') as total,
             count(e.id) filter (where e.status = 'confirmado') as confirmados,
             count(e.id) filter (where e.status = 'recusou') as recusas
      from missoes m
      left join aeronaves a on a.id = m.aeronave_id
      left join missao_equipe e on e.missao_id = m.id
      group by m.id, a.codinome
      order by (m.status in ('acionada', 'pronta')) desc, m.criado_em desc
      limit 30`,
  ]);
  const ativas = missoes.filter((m) => ["acionada", "pronta"].includes(m.status));
  const anteriores = missoes.filter((m) => !["acionada", "pronta"].includes(m.status));

  return (
    <Moldura titulo="Painel de missões" ativo="/">
      <section className="grid grid-cols-3 gap-2">
        {aeronaves.map((a) => (
          <div key={a.id} className="cartao p-3">
            <p className="font-display text-lg font-semibold leading-none">{a.codinome.replace("RESGATE", "R")}</p>
            <p className="mt-1 text-xs text-goa-hangar">{a.matricula}</p>
            <p className="mt-2 flex items-center gap-1.5 text-xs">
              <span className={`h-2 w-2 rounded-full ${SITUACAO[a.situacao].cor}`} />
              {SITUACAO[a.situacao].rotulo}
            </p>
          </div>
        ))}
      </section>

      <Link href="/missoes/nova" className="botao py-4 text-lg">
        + Nova missão
      </Link>

      <section className="flex flex-col gap-2">
        <h2 className="rotulo">Em andamento</h2>
        {ativas.length === 0 && <p className="text-sm text-goa-hangar">Nenhuma missão em andamento.</p>}
        {ativas.map((m) => (
          <CartaoMissao key={m.id} m={m} />
        ))}
      </section>

      {anteriores.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="rotulo">Anteriores</h2>
          {anteriores.map((m) => (
            <CartaoMissao key={m.id} m={m} />
          ))}
        </section>
      )}
    </Moldura>
  );
}

function CartaoMissao({ m }) {
  const st = STATUS_MISSAO[m.status];
  const total = Number(m.total);
  const ok = Number(m.confirmados);
  return (
    <Link href={`/missoes/${m.id}`} className="cartao flex flex-col gap-2 active:bg-goa-fuselagem">
      <div className="flex items-center justify-between gap-2">
        <span className="font-display text-lg font-semibold">
          {m.numero} · <span className="text-goa-vermelho">{m.codinome}</span>
        </span>
        <span className={`selo ${st.cor}`}>{st.rotulo}</span>
      </div>
      <p className="text-sm">
        {m.origem || "?"} → {m.destino || "?"} <span className="text-goa-hangar">· {m.tipo}</span>
      </p>
      <div className="flex items-center justify-between text-xs text-goa-hangar">
        <span>{dataHora(m.previsao)}</span>
        <span>
          {ok}/{total} confirmados
          {Number(m.recusas) > 0 && <span className="ml-2 font-semibold text-goa-vermelho">{m.recusas} recusa(s)</span>}
        </span>
      </div>
      {total > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-goa-linha">
          <div className="h-full bg-goa-verde" style={{ width: `${(ok / total) * 100}%` }} />
        </div>
      )}
    </Link>
  );
}
