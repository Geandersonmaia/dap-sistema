"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { criarMissao } from "@/app/missoes/actions";
import { FUNCOES, FUNCOES_MISSAO, nomeCompleto, PODE_OCUPAR, TIPOS_MISSAO } from "@/lib/formato";
import Microfone from "./Microfone";

export default function FormMissao({ aeronaves, pessoas }) {
  const [estado, acao] = useFormState(criarMissao, null);
  const [aeronave, setAeronave] = useState(null);

  return (
    <form action={acao} className="flex flex-col gap-5">
      <fieldset className="flex flex-col gap-2">
        <legend className="rotulo mb-2">Aeronave</legend>
        <div className="grid grid-cols-3 gap-2">
          {aeronaves.map((a) => (
            <label
              key={a.id}
              className={`cartao cursor-pointer p-3 ${
                aeronave === a.id ? "border-goa-vermelho ring-2 ring-goa-vermelho" : ""
              } ${a.situacao !== "disponivel" ? "opacity-50" : ""}`}
            >
              <input
                type="radio"
                name="aeronave_id"
                value={a.id}
                className="sr-only"
                onChange={() => setAeronave(a.id)}
                disabled={a.situacao !== "disponivel"}
              />
              <span className="block font-display text-lg font-semibold leading-none">{a.codinome}</span>
              <span className="mt-1 block text-xs text-goa-hangar">{a.matricula}</span>
              <span className="block text-[11px] leading-tight text-goa-hangar">{a.modelo}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Secao titulo="Missão">
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
        <Campo rotulo="Apresentação / decolagem (horário de Porto Velho)">
          <input type="datetime-local" name="previsao" className="campo" />
        </Campo>
      </Secao>

      <Secao titulo="Equipe">
        {pessoas.length === 0 && (
          <p className="text-sm text-goa-hangar">
            Nenhuma pessoa cadastrada.{" "}
            <Link href="/equipe" className="font-medium text-goa-vermelho underline">
              Cadastrar equipe
            </Link>
          </p>
        )}
        {FUNCOES_MISSAO.map((f) => {
          const opcoes = pessoas.filter((p) => p.funcoes.some((x) => PODE_OCUPAR[f].includes(x)));
          return (
            <Campo key={f} rotulo={FUNCOES[f]}>
              <select name={`equipe_${f}`} className="campo" defaultValue="">
                <option value="">{opcoes.length ? "— não vai —" : "— ninguém cadastrado —"}</option>
                {opcoes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {nomeCompleto(p)}
                  </option>
                ))}
              </select>
            </Campo>
          );
        })}
      </Secao>

      <Secao titulo="Paciente">
        <div className="grid grid-cols-[1fr_5rem] gap-3">
          <CampoTexto nome="paciente_nome" rotulo="Nome" />
          <Campo rotulo="Idade">
            <input name="paciente_idade" inputMode="numeric" className="campo" />
          </Campo>
        </div>
        <CampoTexto nome="paciente_condicao" rotulo="Quadro clínico (só médico e enfermeiro recebem)" multilinha />
      </Secao>

      <Secao titulo="Observações">
        <CampoTexto nome="observacoes" rotulo="Informações extras para a equipe" multilinha />
      </Secao>

      {estado?.erro && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{estado.erro}</p>}
      <BotaoEnviar />
    </form>
  );
}

function BotaoEnviar() {
  const { pending } = useFormStatus();
  return (
    <button className="botao py-4 text-lg" disabled={pending}>
      {pending ? "Criando missão…" : "Criar missão e preparar convocação"}
    </button>
  );
}

function Secao({ titulo, children }) {
  return (
    <section className="cartao flex flex-col gap-3">
      <h2 className="font-display text-xl font-semibold">{titulo}</h2>
      {children}
    </section>
  );
}

function Campo({ rotulo, children }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-sm font-medium">{rotulo}</span>
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
    <div className="flex flex-col gap-1">
      <label htmlFor={nome} className="text-sm font-medium">
        {rotulo}
      </label>
      <div className="flex gap-2">
        {multilinha ? <textarea id={nome} rows={3} {...props} /> : <input id={nome} {...props} />}
        <Microfone onTexto={anexar} rotulo="" />
      </div>
    </div>
  );
}
