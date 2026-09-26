import { notFound } from "next/navigation";
import Moldura from "@/components/Moldura";
import PainelMissao from "@/components/PainelMissao";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function Missao({ params }) {
  const id = Number(params.id);
  const [[missao], equipe, pessoas] = await Promise.all([
    sql`
      select m.*, a.codinome, a.matricula, a.modelo
      from missoes m left join aeronaves a on a.id = m.aeronave_id
      where m.id = ${id}`,
    sql`
      select e.id, e.funcao, e.status, e.enviado_em, e.respondido_em, e.pessoa_id,
             p.nome, p.posto, p.whatsapp
      from missao_equipe e join pessoas p on p.id = e.pessoa_id
      where e.missao_id = ${id}
      order by array_position(array['piloto','copiloto','tripulante','medico','enfermeiro'], e.funcao), e.id`,
    sql`select id, nome, posto, funcoes from pessoas where ativo order by nome`,
  ]);
  if (!missao) notFound();

  return (
    <Moldura titulo={`Missão ${missao.numero}`} voltar="/">
      <PainelMissao missao={JSON.parse(JSON.stringify(missao))} equipe={JSON.parse(JSON.stringify(equipe))} pessoas={pessoas} />
    </Moldura>
  );
}
