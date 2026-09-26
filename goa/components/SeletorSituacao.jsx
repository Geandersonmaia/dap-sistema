"use client";

import { SITUACAO } from "./Aeronave";

// Salva a situação da aeronave assim que ela é alterada
export default function SeletorSituacao({ situacao, rotulo }) {
  return (
    <select
      name="situacao"
      defaultValue={situacao}
      aria-label={rotulo}
      onChange={(e) => e.target.form.requestSubmit()}
      className={`appearance-none rounded-full bg-white/10 px-3 py-1.5 text-[13px] font-semibold focus:outline-none ${SITUACAO[situacao].texto}`}
    >
      {Object.entries(SITUACAO).map(([k, v]) => (
        <option key={k} value={k}>
          {v.rotulo}
        </option>
      ))}
    </select>
  );
}
