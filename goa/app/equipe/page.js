import { IconeAeronave } from "@/components/Aeronave";
import CadastroPessoa from "@/components/CadastroPessoa";
import Moldura from "@/components/Moldura";
import SeletorSituacao from "@/components/SeletorSituacao";
import { sql } from "@/lib/db";
import { FUNCOES } from "@/lib/formato";
import { alternarAtivo, mudarSituacaoAeronave } from "./actions";

export const dynamic = "force-dynamic";

export default async function Equipe() {
  const [pessoas, aeronaves] = await Promise.all([
    sql`select * from pessoas order by ativo desc, orgao, nome`,
    sql`select * from aeronaves order by codinome`,
  ]);
  const ativas = pessoas.filter((p) => p.ativo).length;
  return (
    <Moldura titulo="Equipe" subtitulo={ativas === 1 ? "1 pessoa ativa" : `${ativas} pessoas ativas`} ativo="/equipe">
      <CadastroPessoa />

      <section className="flex flex-col gap-2">
        <h2 className="rotulo px-1">Pessoas</h2>
        <div className="vidro divide-y divide-white/10 overflow-hidden">
          {pessoas.length === 0 && <p className="p-4 text-[15px] text-goa-suave">Ninguém cadastrado ainda.</p>}
          {pessoas.map((p) => (
            <div key={p.id} className={`flex items-center gap-3 px-4 py-3 ${p.ativo ? "" : "opacity-40"}`}>
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full text-[13px] font-bold ${
                  p.orgao === "SESAU" ? "bg-goa-amarelo/20 text-goa-amarelo" : "bg-goa-vermelho/20 text-red-300"
                }`}
              >
                {p.orgao === "SESAU" ? "SES" : "BM"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-medium">{[p.posto, p.nome].filter(Boolean).join(" ")}</p>
                <p className="truncate text-[13px] text-goa-suave">
                  {p.funcoes.map((f) => FUNCOES[f] || f).join(", ")}
                  {p.whatsapp ? ` · ${p.whatsapp}` : " · sem WhatsApp"}
                </p>
              </div>
              <form action={alternarAtivo.bind(null, p.id)}>
                <button className="text-[13px] font-medium text-goa-azul">{p.ativo ? "Desativar" : "Reativar"}</button>
              </form>
            </div>
          ))}
        </div>
      </section>

      <section id="aeronaves" className="flex scroll-mt-16 flex-col gap-2">
        <h2 className="rotulo px-1">Aeronaves</h2>
        <div className="vidro divide-y divide-white/10 overflow-hidden">
          {aeronaves.map((a) => (
            <form key={a.id} action={mudarSituacaoAeronave} className="flex items-center gap-3 px-4 py-3">
              <IconeAeronave tipo={a.tipo} className="h-11 w-11" />
              <div className="min-w-0 flex-1">
                <p className="whitespace-nowrap text-[17px] font-semibold leading-tight">{a.codinome}</p>
                <p className="truncate text-[13px] text-goa-suave">
                  {a.matricula} · {a.modelo}
                </p>
              </div>
              <input type="hidden" name="id" value={a.id} />
              <SeletorSituacao situacao={a.situacao} rotulo={`Situação ${a.codinome}`} />
            </form>
          ))}
        </div>
      </section>
    </Moldura>
  );
}
