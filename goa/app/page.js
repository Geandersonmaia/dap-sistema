import Link from "next/link";
import { IconeAeronave, SITUACAO } from "@/components/Aeronave";
import Icone from "@/components/Icone";
import Moldura from "@/components/Moldura";
import { sql } from "@/lib/db";
import { dataHora, STATUS_MISSAO } from "@/lib/formato";

export const dynamic = "force-dynamic";

const ATALHOS = [
  { href: "/missoes/nova", rotulo: "Nova missão", icone: "mais", fundo: "linear-gradient(145deg,#F4545A,#B81A20)" },
  { href: "/equipe", rotulo: "Equipe", icone: "pessoas", fundo: "linear-gradient(145deg,#4C86F0,#1F4FA3)" },
  { href: "/equipe#aeronaves", rotulo: "Aeronaves", icone: "aviao", fundo: "linear-gradient(145deg,#3DD17A,#15803D)" },
  { href: "/#missoes", rotulo: "Missões", icone: "documento", fundo: "linear-gradient(145deg,#F2C45A,#B7862A)" },
];

export default async function Painel() {
  const [aeronaves, missoes] = await Promise.all([
    sql`select * from aeronaves order by codinome`,
    sql`
      select m.id, m.numero, m.tipo, m.origem, m.destino, m.previsao, m.status,
             a.codinome, a.tipo as aeronave_tipo,
             count(e.id) filter (where e.status <> 'substituido') as total,
             count(e.id) filter (where e.status = 'confirmado') as confirmados,
             count(e.id) filter (where e.status = 'recusou') as recusas
      from missoes m
      left join aeronaves a on a.id = m.aeronave_id
      left join missao_equipe e on e.missao_id = m.id
      group by m.id, a.codinome, a.tipo
      order by (m.status in ('acionada', 'pronta')) desc, m.criado_em desc
      limit 30`,
  ]);
  const ativas = missoes.filter((m) => ["acionada", "pronta"].includes(m.status));
  const anteriores = missoes.filter((m) => !["acionada", "pronta"].includes(m.status));

  return (
    <Moldura titulo="Operações" subtitulo={ativas.length === 0 ? "Nenhuma missão em andamento" : ativas.length === 1 ? "1 missão em andamento" : `${ativas.length} missões em andamento`} ativo="/">
      <section className="grid grid-cols-4 gap-2">
        {ATALHOS.map((a, i) => (
          <Link key={a.href} href={a.href} className="flex flex-col items-center gap-1.5 active:scale-95 transition">
            <span
              className="icone-app h-[60px] w-[60px] animate-flutuar"
              style={{ background: a.fundo, animationDelay: `${i * -1.2}s` }}
            >
              <Icone nome={a.icone} className="h-7 w-7" traco={2} />
            </span>
            <span className="text-center text-[12px] font-medium leading-tight">{a.rotulo}</span>
          </Link>
        ))}
      </section>

      <section className="vidro divide-y divide-white/10 overflow-hidden">
        {aeronaves.map((a) => {
          const s = SITUACAO[a.situacao];
          return (
            <div key={a.id} className="flex items-center gap-3 px-4 py-3">
              <IconeAeronave tipo={a.tipo} className="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="text-[17px] font-semibold leading-tight">{a.codinome}</p>
                <p className="truncate text-[13px] text-goa-suave">
                  {a.matricula} · {a.modelo}
                </p>
              </div>
              <span className={`flex items-center gap-1.5 text-[13px] font-medium ${s.texto}`}>
                <span className={`h-2 w-2 rounded-full ${s.cor} shadow-[0_0_8px_currentColor]`} />
                {s.rotulo}
              </span>
            </div>
          );
        })}
      </section>

      <section id="missoes" className="flex scroll-mt-16 flex-col gap-2.5">
        <h2 className="rotulo px-1">Em andamento</h2>
        {ativas.length === 0 && (
          <div className="vidro px-4 py-6 text-center text-[15px] text-goa-suave">Nenhuma missão em andamento.</div>
        )}
        {ativas.map((m) => (
          <CartaoMissao key={m.id} m={m} />
        ))}
      </section>

      {anteriores.length > 0 && (
        <section className="flex flex-col gap-2.5">
          <h2 className="rotulo px-1">Anteriores</h2>
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
    <Link href={`/missoes/${m.id}`} className="cartao flex flex-col gap-3 transition active:scale-[0.98]">
      <div className="flex items-center gap-3">
        <IconeAeronave tipo={m.aeronave_tipo} className="h-10 w-10" />
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-semibold leading-tight">
            {m.origem || "?"} → {m.destino || "?"}
          </p>
          <p className="text-[13px] text-goa-suave">
            {m.numero} · {m.codinome}
          </p>
        </div>
        <span className={`selo ${st.cor}`}>{st.rotulo}</span>
      </div>
      <div className="flex items-center justify-between text-[13px] text-goa-suave">
        <span className="flex items-center gap-1">
          <Icone nome="relogio" className="h-4 w-4" />
          {dataHora(m.previsao)}
        </span>
        <span>
          {ok}/{total} confirmados
          {Number(m.recusas) > 0 && <span className="ml-2 font-semibold text-red-300">{m.recusas} recusa(s)</span>}
        </span>
      </div>
      {total > 0 && (
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-goa-azul to-goa-verde shadow-[0_0_10px_rgba(34,179,90,.6)]"
            style={{ width: `${(ok / total) * 100}%` }}
          />
        </div>
      )}
    </Link>
  );
}
