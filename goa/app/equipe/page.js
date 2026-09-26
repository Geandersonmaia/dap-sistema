import Moldura from "@/components/Moldura";
import CadastroPessoa from "@/components/CadastroPessoa";
import { sql } from "@/lib/db";
import { FUNCOES } from "@/lib/formato";
import { alternarAtivo, mudarSituacaoAeronave } from "./actions";

export const dynamic = "force-dynamic";

export default async function Equipe() {
  const [pessoas, aeronaves] = await Promise.all([
    sql`select * from pessoas order by ativo desc, orgao, nome`,
    sql`select * from aeronaves order by codinome`,
  ]);
  return (
    <Moldura titulo="Equipe e aeronaves" ativo="/equipe">
      <CadastroPessoa />

      <section className="flex flex-col gap-2">
        <h2 className="rotulo">Pessoas cadastradas ({pessoas.filter((p) => p.ativo).length} ativas)</h2>
        {pessoas.length === 0 && <p className="text-sm text-goa-hangar">Ninguém cadastrado ainda.</p>}
        {pessoas.map((p) => (
          <div key={p.id} className={`cartao flex items-center justify-between gap-3 py-3 ${p.ativo ? "" : "opacity-50"}`}>
            <div className="min-w-0">
              <p className="truncate font-medium">{[p.posto, p.nome].filter(Boolean).join(" ")}</p>
              <p className="text-xs text-goa-hangar">
                {p.funcoes.map((f) => FUNCOES[f] || f).join(", ")} · {p.orgao}
                {p.whatsapp ? ` · ${p.whatsapp}` : " · sem WhatsApp"}
              </p>
            </div>
            <form action={alternarAtivo.bind(null, p.id)}>
              <button className="text-xs text-goa-hangar underline">{p.ativo ? "Desativar" : "Reativar"}</button>
            </form>
          </div>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="rotulo">Aeronaves</h2>
        {aeronaves.map((a) => (
          <div key={a.id} className="cartao flex items-center justify-between gap-3 py-3">
            <div>
              <p className="font-display text-lg font-semibold leading-none">
                {a.codinome} · <span className="text-goa-hangar">{a.matricula}</span>
              </p>
              <p className="text-xs text-goa-hangar">{a.modelo}</p>
            </div>
            <form action={mudarSituacaoAeronave} className="flex items-center gap-1">
              <input type="hidden" name="id" value={a.id} />
              <select name="situacao" defaultValue={a.situacao} className="campo w-auto py-1.5 text-sm" aria-label={`Situação ${a.codinome}`}>
                <option value="disponivel">Disponível</option>
                <option value="manutencao">Manutenção</option>
                <option value="indisponivel">Indisponível</option>
              </select>
              <button className="botao-sec px-2 py-1.5 text-sm">OK</button>
            </form>
          </div>
        ))}
      </section>
    </Moldura>
  );
}
