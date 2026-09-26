"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { marcarEnviado, mudarStatusMissao, responder, substituir } from "@/app/missoes/actions";
import {
  dataHora,
  FUNCOES,
  hora,
  nomeCompleto,
  numeroWhatsApp,
  PODE_OCUPAR,
  STATUS_MEMBRO,
  STATUS_MISSAO,
} from "@/lib/formato";
import { mensagemConvocacao, textoMissao } from "@/lib/mensagem";
import { gerarPdfMissao } from "@/lib/pdf";
import { IconeAeronave } from "./Aeronave";
import Icone, { IconeWhatsApp } from "./Icone";

export default function PainelMissao({ missao, equipe, pessoas }) {
  const router = useRouter();
  // Atualiza ao voltar do WhatsApp para o app e a cada 30 s
  useEffect(() => {
    const atualizar = () => document.visibilityState === "visible" && router.refresh();
    document.addEventListener("visibilitychange", atualizar);
    const t = setInterval(atualizar, 30000);
    return () => {
      document.removeEventListener("visibilitychange", atualizar);
      clearInterval(t);
    };
  }, [router]);

  const [copiado, setCopiado] = useState(false);
  const [pendente, iniciar] = useTransition();
  const ativos = equipe.filter((m) => m.status !== "substituido");
  const confirmados = ativos.filter((m) => m.status === "confirmado").length;
  const st = STATUS_MISSAO[missao.status];
  const encerrada = ["concluida", "cancelada"].includes(missao.status);
  const progresso = ativos.length ? confirmados / ativos.length : 0;

  async function copiar() {
    const t = textoMissao(missao, equipe);
    try {
      await navigator.clipboard.writeText(t);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      window.prompt("Copie o texto:", t);
    }
  }

  return (
    <>
      <section className="vidro relative overflow-hidden p-5">
        <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-goa-azul/30 blur-3xl" />
        <div className="relative flex items-start gap-3">
          <IconeAeronave tipo={missao.tipo_aeronave} className="h-14 w-14 animate-flutuar" />
          <div className="min-w-0 flex-1">
            <p className="text-[22px] font-bold leading-tight tracking-tight text-goa-dourado">{missao.codinome}</p>
            <p className="text-[13px] text-goa-suave">
              {missao.matricula} · {missao.modelo}
            </p>
          </div>
          <span className={`selo ${st.cor}`}>{st.rotulo}</span>
        </div>
        <div className="relative mt-5 flex items-center gap-2">
          <p className="min-w-0 flex-1 text-[22px] font-bold leading-tight tracking-tight">{missao.origem || "?"}</p>
          <span className="flex shrink-0 items-center gap-1 text-goa-suave">
            <span className="h-px w-5 bg-white/30" />
            <Icone nome="aviao" className="h-5 w-5 rotate-90" />
            <span className="h-px w-5 bg-white/30" />
          </span>
          <p className="min-w-0 flex-1 text-right text-[22px] font-bold leading-tight tracking-tight">{missao.destino || "?"}</p>
        </div>
        <dl className="relative mt-4 grid grid-cols-2 gap-3 text-[15px]">
          <Dado icone="relogio" rotulo="Decolagem" valor={dataHora(missao.previsao)} />
          <Dado icone="hospital" rotulo="Hospital" valor={missao.hospital || "—"} />
        </dl>
      </section>

      <section className="flex flex-col gap-2.5">
        <div className="flex items-end justify-between px-1">
          <h2 className="rotulo">Equipe</h2>
          <span className="text-[13px] font-medium text-goa-suave">
            {confirmados} de {ativos.length} confirmados
          </span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-goa-azul to-goa-verde transition-all duration-700"
            style={{ width: `${progresso * 100}%` }}
          />
        </div>
        {equipe.map((m) => (
          <Membro key={m.id} m={m} missao={missao} equipe={equipe} pessoas={pessoas} bloqueado={encerrada} />
        ))}
      </section>

      {(missao.paciente_nome || missao.paciente_condicao) && (
        <section className="cartao flex gap-3">
          <span className="icone-app h-10 w-10 shrink-0" style={{ background: "linear-gradient(145deg,#F2C45A,#B7862A)" }}>
            <Icone nome="paciente" className="h-5 w-5" traco={2} />
          </span>
          <div className="min-w-0">
            <p className="text-[17px] font-semibold">
              {[missao.paciente_nome, missao.paciente_idade && `${missao.paciente_idade} anos`].filter(Boolean).join(", ")}
            </p>
            {missao.paciente_condicao && <p className="text-[15px] text-goa-suave">{missao.paciente_condicao}</p>}
          </div>
        </section>
      )}
      {missao.observacoes && (
        <section className="cartao">
          <h2 className="rotulo mb-1">Observações</h2>
          <p className="text-[15px]">{missao.observacoes}</p>
        </section>
      )}

      <section className="grid grid-cols-2 gap-2">
        <button type="button" className="botao-sec" onClick={copiar}>
          <Icone nome={copiado ? "check" : "copiar"} className="h-5 w-5" />
          {copiado ? "Copiado" : "Copiar texto"}
        </button>
        <button type="button" className="botao-sec" onClick={() => gerarPdfMissao(missao, equipe)}>
          <Icone nome="documento" className="h-5 w-5" />
          Baixar PDF
        </button>
        {encerrada ? (
          <button
            type="button"
            className="botao-sec col-span-2"
            disabled={pendente}
            onClick={() => iniciar(() => mudarStatusMissao(missao.id, "acionada"))}
          >
            Reabrir missão
          </button>
        ) : (
          <>
            <button
              type="button"
              className="botao-sec text-red-300"
              disabled={pendente}
              onClick={() => iniciar(() => mudarStatusMissao(missao.id, "cancelada"))}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="botao"
              style={{ background: "linear-gradient(180deg,#3DD17A,#15803D)", boxShadow: "0 10px 24px -8px rgba(34,179,90,.7)" }}
              disabled={pendente}
              onClick={() => iniciar(() => mudarStatusMissao(missao.id, "concluida"))}
            >
              <Icone nome="check" className="h-5 w-5" traco={2.4} />
              Concluir
            </button>
          </>
        )}
      </section>
    </>
  );
}

function Dado({ icone, rotulo, valor }) {
  return (
    <div className="flex gap-2">
      <Icone nome={icone} className="mt-0.5 h-5 w-5 shrink-0 text-goa-azul" />
      <div className="min-w-0">
        <dt className="text-[12px] text-goa-suave">{rotulo}</dt>
        <dd className="font-medium leading-snug">{valor}</dd>
      </div>
    </div>
  );
}

function Membro({ m, missao, equipe, pessoas, bloqueado }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  // Executa a ação no servidor e recarrega os dados da tela
  const agir = (fn) =>
    iniciar(async () => {
      await fn();
      router.refresh();
    });
  const [trocando, setTrocando] = useState(false);
  const [novo, setNovo] = useState("");
  const st = STATUS_MEMBRO[m.status];
  const fone = numeroWhatsApp(m.whatsapp);
  const link = fone ? `https://wa.me/${fone}?text=${encodeURIComponent(mensagemConvocacao(missao, m, equipe))}` : null;
  const naMissao = new Set(equipe.filter((e) => e.status !== "substituido").map((e) => e.pessoa_id));
  const opcoes = pessoas.filter(
    (p) => !naMissao.has(p.id) && p.funcoes.some((f) => (PODE_OCUPAR[m.funcao] || [m.funcao]).includes(f))
  );

  if (m.status === "substituido") {
    return (
      <div className="flex items-center justify-between px-4 py-1 text-[13px] text-goa-suave">
        <span className="line-through">
          {FUNCOES[m.funcao]}: {nomeCompleto(m)}
        </span>
        <span>substituído</span>
      </div>
    );
  }

  const borda =
    m.status === "recusou"
      ? "border-goa-vermelho/60 shadow-[0_0_24px_-6px_rgba(224,36,43,.6)]"
      : m.status === "confirmado"
        ? "border-goa-verde/50"
        : "";
  const iniciaisNome = nomeCompleto(m)
    .split(" ")
    .filter((p) => /^[A-ZÀ-Ú]/.test(p) && p.length > 2)
    .slice(-2)
    .map((p) => p[0])
    .join("");

  return (
    <div className={`cartao flex flex-col gap-3 ${borda}`}>
      <div className="flex items-center gap-3">
        <span className="relative grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-to-br from-white/20 to-white/5 text-[15px] font-semibold">
          {iniciaisNome}
          {m.status === "confirmado" && (
            <span className="absolute -bottom-0.5 -right-0.5 grid h-5 w-5 place-items-center rounded-full border-2 border-goa-noite bg-goa-verde">
              <Icone nome="check" className="h-3 w-3" traco={3} />
            </span>
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-goa-suave">{FUNCOES[m.funcao]}</p>
          <p className="truncate text-[17px] font-semibold leading-tight">{nomeCompleto(m)}</p>
          {(m.enviado_em || m.respondido_em) && (
            <p className="text-[12px] text-goa-suave">
              {m.enviado_em && `Enviado ${hora(m.enviado_em)}`}
              {m.respondido_em && ` · Respondeu ${hora(m.respondido_em)}`}
            </p>
          )}
        </div>
        <span className={`selo shrink-0 ${st.cor}`}>{st.rotulo}</span>
      </div>

      {!bloqueado && (
        <div className="flex flex-col gap-2">
          {m.status === "pendente" &&
            (link ? (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => agir(() => marcarEnviado(m.id))}
                className="botao py-3"
                style={{ background: "linear-gradient(180deg,#2BD46A,#179C4B)", boxShadow: "0 10px 24px -8px rgba(37,211,102,.6)" }}
              >
                <IconeWhatsApp />
                Enviar no WhatsApp
              </a>
            ) : (
              <p className="text-[15px] text-red-300">Sem WhatsApp cadastrado.</p>
            ))}
          {m.status !== "pendente" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={pendente || m.status === "confirmado"}
                onClick={() => agir(() => responder(m.id, "confirmado"))}
                className="botao-sec py-2.5 text-[15px] text-emerald-300"
              >
                <Icone nome="check" className="h-4 w-4" traco={2.4} />
                Confirmou
              </button>
              <button
                type="button"
                disabled={pendente || m.status === "recusou"}
                onClick={() => agir(() => responder(m.id, "recusou"))}
                className="botao-sec py-2.5 text-[15px] text-red-300"
              >
                <Icone nome="x" className="h-4 w-4" traco={2.4} />
                Não pode
              </button>
            </div>
          )}
          {(m.status === "recusou" || trocando) && (
            <div className="flex gap-2">
              <select className="campo py-2.5" value={novo} onChange={(e) => setNovo(e.target.value)} aria-label="Substituto">
                <option value="">{opcoes.length ? "Escolher substituto…" : "Ninguém disponível"}</option>
                {opcoes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {nomeCompleto(p)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="botao shrink-0 py-2.5"
                disabled={!novo || pendente}
                onClick={() => agir(() => substituir(m.id, novo))}
              >
                Trocar
              </button>
            </div>
          )}
          <div className="flex gap-4 px-1">
            {m.status !== "pendente" && link && (
              <a
                href={link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[13px] font-medium text-[#2BD46A]"
              >
                <IconeWhatsApp className="h-4 w-4" />
                Reenviar
              </a>
            )}
            {m.status !== "recusou" && !trocando && (
              <button type="button" className="flex items-center gap-1 text-[13px] font-medium text-goa-azul" onClick={() => setTrocando(true)}>
                <Icone nome="trocar" className="h-4 w-4" />
                Trocar pessoa
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
