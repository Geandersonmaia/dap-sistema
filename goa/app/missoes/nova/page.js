import Moldura from "@/components/Moldura";
import FormMissao from "@/components/FormMissao";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function NovaMissao() {
  const [aeronaves, pessoas] = await Promise.all([
    sql`select * from aeronaves order by codinome`,
    sql`select id, nome, posto, funcoes from pessoas where ativo order by nome`,
  ]);
  return (
    <Moldura titulo="Nova missão" subtitulo="Preencha ou dite pelo microfone" voltar="/">
      <FormMissao aeronaves={aeronaves} pessoas={pessoas} />
    </Moldura>
  );
}
