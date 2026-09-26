"use client";

import { useFormState } from "react-dom";
import { entrar } from "./actions";
import Brasao from "@/components/Brasao";

export default function LoginPage() {
  const [estado, acao] = useFormState(entrar, null);
  return (
    <main className="flex min-h-dvh flex-col justify-center px-6 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col items-center gap-5 text-center">
          <div className="relative animate-flutuar">
            <div className="absolute inset-4 rounded-full bg-goa-azul/40 blur-3xl" />
            <Brasao className="relative h-40 w-40 drop-shadow-[0_20px_40px_rgba(0,0,0,0.6)]" />
          </div>
          <div>
            <h1 className="font-display text-[34px] font-bold tracking-tight">GOA Missões</h1>
            <p className="text-[15px] text-goa-suave">Grupo de Operações Aéreas · CBMRO</p>
          </div>
        </div>
        <form action={acao} className="vidro flex flex-col gap-4 p-5">
          <label htmlFor="pin" className="text-[15px] font-medium text-goa-suave">
            PIN de acesso
          </label>
          <input
            id="pin"
            name="pin"
            type="password"
            inputMode="numeric"
            autoComplete="current-password"
            required
            className="campo text-center text-2xl tracking-[0.5em]"
          />
          {estado?.erro && <p className="text-center text-sm text-red-300">{estado.erro}</p>}
          <button className="botao">Entrar</button>
        </form>
      </div>
    </main>
  );
}
