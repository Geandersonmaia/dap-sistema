"use client";

import { useFormState } from "react-dom";
import { entrar } from "./actions";
import Brasao from "@/components/Brasao";

export default function LoginPage() {
  const [estado, acao] = useFormState(entrar, null);
  return (
    <main className="min-h-dvh bg-goa-noite text-white flex flex-col justify-center px-6">
      <div className="mx-auto w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <Brasao className="h-16 w-16" />
          <h1 className="font-display text-4xl font-semibold tracking-wide">GOA · Missões</h1>
          <p className="text-sm text-white/70">Grupamento de Operações Aéreas · CBMRO</p>
        </div>
        <form action={acao} className="flex flex-col gap-3">
          <label htmlFor="pin" className="text-sm text-white/80">
            PIN de acesso
          </label>
          <input
            id="pin"
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            required
            className="rounded-lg bg-goa-noite2 border border-white/15 px-4 py-3 text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-goa-dourado"
          />
          {estado?.erro && <p className="text-sm text-red-300">{estado.erro}</p>}
          <button className="mt-2 rounded-lg bg-goa-vermelho py-3 font-semibold active:bg-goa-vermelhoEsc">Entrar</button>
        </form>
      </div>
    </main>
  );
}
