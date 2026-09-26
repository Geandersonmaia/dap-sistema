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
      <section className="rounded-xl bg-goa-noite p-4 text-white">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-display text-3xl font-bold leading-none text-goa-dourado">{missao.codinome}</p>
            <p className="mt-1 text-sm text-white/70">
              {missao.matricula} · {missao.modelo}
            </p>
          </div>
          <span className={`selo ${st.cor}`}>{st.rotulo}</span>
        </div>
        <p className="mt-4 font-display text-2xl font-semibold">
          {missao.origem || "?"} → {missao.destino || "?"}
        </p>
        {missao.hospital && <p className="text-sm text-white/80">{missao.hospital}</p>}
        <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-white/50">Decolagem</dt>
            <dd>{dataHora(missao.previsao)}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-white/50">Tipo</dt>
            <dd>{missao.tipo}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between">
          <h2 className="rotulo">Equipe</h2>
          <span className="text-sm text-goa-hangar">
            {confirmados}/{ativos.length} confirmados
          </span>
        </div>
        {equipe.map((m) => (
          <Membro key={m.id} m={m} missao={missao} equipe={equipe} pessoas={pessoas} bloqueado={encerrada} />
        ))}
      </section>

      {(missao.paciente_nome || missao.paciente_condicao) && (
        <section className="cartao flex flex-col gap-1 text-sm">
          <h2 className="rotulo">Paciente</h2>
          <p className="font-medium">
            {[missao.paciente_nome, missao.paciente_idade && `${missao.paciente_idade} anos`].filter(Boolean).join(", ")}
          </p>
          {missao.paciente_condicao && <p className="text-goa-hangar">{missao.paciente_condicao}</p>}
        </section>
      )}
      {missao.observacoes && (
        <section className="cartao text-sm">
          <h2 className="rotulo mb-1">Observações</h2>
          <p>{missao.observacoes}</p>
        </section>
      )}

      <section className="grid grid-cols-2 gap-2">
        <button type="button" className="botao-sec" onClick={copiar}>
          {copiado ? "Copiado" : "Copiar texto"}
        </button>
        <button type="button" className="botao-sec" onClick={() => gerarPdfMissao(missao, equipe)}>
          Baixar PDF
        </button>
      </section>

      <section className="grid grid-cols-2 gap-2">
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
              className="botao-sec"
              disabled={pendente}
              onClick={() => iniciar(() => mudarStatusMissao(missao.id, "cancelada"))}
            >
              Cancelar missão
            </button>
            <button
              type="button"
              className="botao bg-goa-noite active:bg-goa-noite2"
              disabled={pendente}
              onClick={() => iniciar(() => mudarStatusMissao(missao.id, "concluida"))}
            >
              Concluir missão
            </button>
          </>
        )}
      </section>
    </>
  );
}

function Membro({ m, missao, equipe, pessoas, bloqueado }) {
  const router = useRouter();
  const [pendente, iniciar] = useTransition();
  // Executa a ação no servidor e recarrega os dados da tela
  const agir = (fn) => iniciar(async () => {
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
      <div className="flex items-center justify-between rounded-lg px-3 py-1 text-sm text-goa-hangar">
        <span className="line-through">
          {FUNCOES[m.funcao]}: {nomeCompleto(m)}
        </span>
        <span className="text-xs">substituído</span>
      </div>
    );
  }

  return (
    <div
      className={`cartao flex flex-col gap-3 ${m.status === "recusou" ? "border-goa-vermelho" : ""} ${
        m.status === "confirmado" ? "border-goa-verde" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="rotulo">{FUNCOES[m.funcao]}</p>
          <p className="truncate font-medium">{nomeCompleto(m)}</p>
          <p className="text-xs text-goa-hangar">
            {m.enviado_em && `Enviado ${hora(m.enviado_em)}`}
            {m.respondido_em && ` · Respondeu ${hora(m.respondido_em)}`}
          </p>
        </div>
        <span className={`selo shrink-0 ${st.cor}`}>{st.rotulo}</span>
      </div>

      {!bloqueado && (
        <div className="flex flex-col gap-2">
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => agir(() => marcarEnviado(m.id))}
              className={
                m.status === "pendente"
                  ? "botao bg-[#1F9D55] py-2.5 active:bg-[#17803F]"
                  : "self-start text-sm font-medium text-[#17803F] underline"
              }
            >
              {m.status === "pendente" ? "Enviar no WhatsApp" : "Reenviar no WhatsApp"}
            </a>
          ) : (
            <p className="text-sm text-goa-vermelho">Sem WhatsApp cadastrado.</p>
          )}
          {m.status !== "pendente" && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={pendente || m.status === "confirmado"}
                onClick={() => agir(() => responder(m.id, "confirmado"))}
                className="botao-sec py-2 text-sm"
              >
                Confirmou
              </button>
              <button
                type="button"
                disabled={pendente || m.status === "recusou"}
                onClick={() => agir(() => responder(m.id, "recusou"))}
                className="botao-sec py-2 text-sm"
              >
                Não pode
              </button>
            </div>
          )}
          {(m.status === "recusou" || trocando) && (
            <div className="flex gap-2">
              <select className="campo py-2" value={novo} onChange={(e) => setNovo(e.target.value)} aria-label="Substituto">
                <option value="">{opcoes.length ? "Escolher substituto…" : "Ninguém disponível"}</option>
                {opcoes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {nomeCompleto(p)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="botao shrink-0 py-2"
                disabled={!novo || pendente}
                onClick={() => agir(() => substituir(m.id, novo))}
              >
                Trocar
              </button>
            </div>
          )}
          {m.status !== "recusou" && !trocando && (
            <button type="button" className="self-start text-xs text-goa-hangar underline" onClick={() => setTrocando(true)}>
              Trocar pessoa
            </button>
          )}
        </div>
      )}
    </div>
  );
}
