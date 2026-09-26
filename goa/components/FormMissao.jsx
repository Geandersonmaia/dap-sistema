"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { criarMissao } from "@/app/missoes/actions";
import { FUNCOES, FUNCOES_MISSAO, nomeCompleto, PODE_OCUPAR, TIPOS_MISSAO } from "@/lib/formato";
import { IconeAeronave } from "./Aeronave";
import Icone from "./Icone";
import Microfone from "./Microfone";

export default function FormMissao({ aeronaves, pessoas }) {
  const [estado, acao] = useFormState(criarMissao, null);
  const [aeronave, setAeronave] = useState(null);

  return (
    <form action={acao} className="flex flex-col gap-6">
      <Grupo titulo="Aeronave">
        <div className="grid grid-cols-3 gap-2">
          {aeronaves.map((a) => {
            const livre = a.situacao === "disponivel";
            const sel = aeronave === a.id;
            return (
              <label
                key={a.id}
                className={`vidro flex cursor-pointer flex-col items-center gap-2 px-2 py-4 text-center transition active:scale-95 ${
                  sel ? "border-goa-vermelho/80 bg-goa-vermelho/15 shadow-[0_0_24px_-4px_rgba(224,36,43,.6)]" : ""
                } ${livre ? "" : "opacity-40"}`}
              >
                <input
                  type="radio"
                  name="aeronave_id"
                  value={a.id}
                  className="sr-only"
                  onChange={() => setAeronave(a.id)}
                  disabled={!livre}
                />
                <IconeAeronave tipo={a.tipo} className="h-12 w-12" />
                <span className="text-[15px] font-semibold leading-none">{a.codinome.replace("RESGATE", "Resgate")}</span>
                <span className="text-[12px] text-goa-suave">{livre ? a.matricula : "Indisponível"}</span>
              </label>
            );
          })}
        </div>
      </Grupo>

      <Grupo titulo="Missão">
        <div className="vidro flex flex-col gap-4 p-4">
          <Campo rotulo="Tipo">
            <select name="tipo" className="campo" defaultValue={TIPOS_MISSAO[0]}>
              {TIPOS_MISSAO.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Campo>
          <CampoTexto nome="origem" rotulo="Origem" padrao="Porto Velho" />
          <CampoTexto nome="destino" rotulo="Destino" />
          <CampoTexto nome="hospital" rotulo="Hospital de destino" />
          <Campo rotulo="Apresentação / decolagem (hora de Porto Velho)">
            <input type="datetime-local" name="previsao" className="campo" />
          </Campo>
        </div>
      </Grupo>

      <Grupo titulo="Equipe">
        <div className="vidro divide-y divide-white/10 overflow-hidden">
          {pessoas.length === 0 && (
            <p className="p-4 text-[15px] text-goa-suave">
              Nenhuma pessoa cadastrada.{" "}
              <Link href="/equipe" className="font-semibold text-goa-azul">
                Cadastrar equipe
              </Link>
            </p>
          )}
          {FUNCOES_MISSAO.map((f) => {
            const opcoes = pessoas.filter((p) => p.funcoes.some((x) => PODE_OCUPAR[f].includes(x)));
            return (
              <label key={f} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-28 shrink-0 text-[15px]">{FUNCOES[f].replace(" operacional", "")}</span>
                <select
                  name={`equipe_${f}`}
                  defaultValue=""
                  className="min-w-0 flex-1 appearance-none bg-transparent py-1.5 text-right text-[17px] text-goa-azul focus:outline-none"
                >
                  <option value="">{opcoes.length ? "Escolher" : "Ninguém cadastrado"}</option>
                  {opcoes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {nomeCompleto(p)}
                    </option>
                  ))}
                </select>
                <Icone nome="chevron" className="h-4 w-4 shrink-0 text-goa-suave" />
              </label>
            );
          })}
        </div>
      </Grupo>

      <Grupo titulo="Paciente" nota="O nome completo e o quadro clínico só vão para o médico e o enfermeiro.">
        <div className="vidro flex flex-col gap-4 p-4">
          <CampoTexto nome="paciente_nome" rotulo="Nome" />
          <Campo rotulo="Idade">
            <input name="paciente_idade" inputMode="numeric" className="campo w-28" />
          </Campo>
          <CampoTexto nome="paciente_condicao" rotulo="Quadro clínico" multilinha />
        </div>
      </Grupo>

      <Grupo titulo="Observações">
        <div className="vidro p-4">
          <CampoTexto nome="observacoes" rotulo="Informações extras para a equipe" multilinha />
        </div>
      </Grupo>

      {estado?.erro && (
        <p className="rounded-2xl border border-goa-vermelho/40 bg-goa-vermelho/15 p-3 text-[15px] text-red-200">{estado.erro}</p>
      )}
      <BotaoEnviar />
    </form>
  );
}

function BotaoEnviar() {
  const { pending } = useFormStatus();
  return (
    <button className="botao py-4" disabled={pending}>
      <Icone nome="enviar" className="h-5 w-5" traco={2} />
      {pending ? "Criando missão…" : "Criar missão e convocar equipe"}
    </button>
  );
}

function Grupo({ titulo, nota, children }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="rotulo px-1">{titulo}</h2>
      {children}
      {nota && <p className="px-1 text-[13px] text-goa-suave">{nota}</p>}
    </section>
  );
}

function Campo({ rotulo, children }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-medium text-goa-suave">{rotulo}</span>
      {children}
    </label>
  );
}

// Campo de texto com botão de ditado ao lado
function CampoTexto({ nome, rotulo, padrao = "", multilinha = false }) {
  const [valor, setValor] = useState(padrao);
  const anexar = useCallback((t) => setValor((v) => (v ? `${v} ${t}` : t)), []);
  const props = { name: nome, value: valor, onChange: (e) => setValor(e.target.value), className: "campo" };
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={nome} className="text-[13px] font-medium text-goa-suave">
        {rotulo}
      </label>
      <div className="flex items-start gap-2">
        {multilinha ? <textarea id={nome} rows={3} {...props} /> : <input id={nome} {...props} />}
        <Microfone onTexto={anexar} />
      </div>
    </div>
  );
}
