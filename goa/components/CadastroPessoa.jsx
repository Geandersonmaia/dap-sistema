"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { cadastrarPessoa } from "@/app/equipe/actions";
import { FUNCOES } from "@/lib/formato";

export default function CadastroPessoa() {
  const [estado, acao] = useFormState(cadastrarPessoa, null);
  const form = useRef(null);
  useEffect(() => {
    if (estado?.ok) form.current?.reset();
  }, [estado]);

  return (
    <details className="cartao" open={false}>
      <summary className="cursor-pointer font-display text-xl font-semibold">+ Cadastrar pessoa</summary>
      <form ref={form} action={acao} className="mt-4 flex flex-col gap-3">
        <div className="grid grid-cols-[6.5rem_1fr] gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Posto</span>
            <input name="posto" placeholder="Cap BM" className="campo" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm font-medium">Nome de guerra ou nome</span>
            <input name="nome" required className="campo" />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">WhatsApp (com DDD)</span>
          <input name="whatsapp" type="tel" inputMode="tel" placeholder="(69) 99999-0000" className="campo" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Órgão</span>
          <select name="orgao" className="campo" defaultValue="CBMRO">
            <option value="CBMRO">CBMRO</option>
            <option value="SESAU">SESAU</option>
            <option value="OUTRO">Outro</option>
          </select>
        </label>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1 text-sm font-medium">Funções que pode exercer</legend>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(FUNCOES).map(([k, v]) => (
              <label key={k} className="flex items-center gap-2 rounded-lg border border-goa-linha px-3 py-2 text-sm">
                <input type="checkbox" name="funcoes" value={k} className="accent-goa-vermelho" />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
        {estado?.erro && <p className="text-sm text-red-700">{estado.erro}</p>}
        {estado?.ok && <p className="text-sm text-emerald-700">{estado.ok}</p>}
        <Salvar />
      </form>
    </details>
  );
}

function Salvar() {
  const { pending } = useFormStatus();
  return (
    <button className="botao" disabled={pending}>
      {pending ? "Salvando…" : "Salvar"}
    </button>
  );
}
