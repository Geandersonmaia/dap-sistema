"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { cadastrarPessoa } from "@/app/equipe/actions";
import { FUNCOES } from "@/lib/formato";
import Icone from "./Icone";

export default function CadastroPessoa() {
  const [estado, acao] = useFormState(cadastrarPessoa, null);
  const form = useRef(null);
  useEffect(() => {
    if (estado?.ok) form.current?.reset();
  }, [estado]);

  return (
    <details className="vidro group overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center gap-3 p-4 [&::-webkit-details-marker]:hidden">
        <span className="icone-app h-10 w-10" style={{ background: "linear-gradient(145deg,#4C86F0,#1F4FA3)" }}>
          <Icone nome="mais" className="h-5 w-5" traco={2.4} />
        </span>
        <span className="flex-1 text-[17px] font-semibold">Cadastrar pessoa</span>
        <Icone nome="chevron" className="h-4 w-4 text-goa-suave transition group-open:rotate-90" />
      </summary>
      <form ref={form} action={acao} className="flex flex-col gap-4 border-t border-white/10 p-4">
        <div className="grid grid-cols-[6.5rem_1fr] gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-goa-suave">Posto</span>
            <input name="posto" placeholder="Cap BM" className="campo" />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-[13px] font-medium text-goa-suave">Nome de guerra ou nome</span>
            <input name="nome" required className="campo" />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-goa-suave">WhatsApp (com DDD)</span>
          <input name="whatsapp" type="tel" inputMode="tel" placeholder="(69) 99999-0000" className="campo" />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-[13px] font-medium text-goa-suave">Órgão</span>
          <select name="orgao" className="campo" defaultValue="CBMRO">
            <option value="CBMRO">CBMRO</option>
            <option value="SESAU">SESAU</option>
            <option value="OUTRO">Outro</option>
          </select>
        </label>
        <fieldset className="flex flex-col gap-1">
          <legend className="mb-1.5 text-[13px] font-medium text-goa-suave">Funções que pode exercer</legend>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(FUNCOES).map(([k, v]) => (
              <label key={k} className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-[15px] has-[:checked]:border-goa-azul/70 has-[:checked]:bg-goa-azul/15">
                <input type="checkbox" name="funcoes" value={k} className="h-4 w-4 accent-goa-azul" />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
        {estado?.erro && <p className="text-sm text-red-300">{estado.erro}</p>}
        {estado?.ok && <p className="text-sm text-emerald-300">{estado.ok}</p>}
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
