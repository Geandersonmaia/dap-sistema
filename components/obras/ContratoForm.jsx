"use client";

import { useState } from "react";
import { Campo, inputClasse, botaoPrimario } from "./Campo";

const VAZIO = {
  nome: "",
  contratante: "",
  numero_contrato: "",
  processo: "",
  objeto: "",
  valor_contrato: "",
  bdi_percent: "",
  reajuste_percent: "",
  data_base: "",
  data_inicio: "",
  prazo_meses: "",
  participacao_lucro_percent: "",
};

export default function ContratoForm({ inicial, onSalvar, textoBotao = "Salvar" }) {
  const [form, setForm] = useState(() => {
    const base = { ...VAZIO };
    for (const k of Object.keys(VAZIO)) if (inicial?.[k] !== null && inicial?.[k] !== undefined) base[k] = String(inicial[k]);
    return base;
  });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function enviar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      await onSalvar(form);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={enviar} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Campo label="Nome da obra *" className="md:col-span-2">
          <input required className={inputClasse} value={form.nome} onChange={set("nome")} placeholder="Ex.: Reforma da UBS Centro" />
        </Campo>
        <Campo label="Órgão contratante">
          <input className={inputClasse} value={form.contratante} onChange={set("contratante")} placeholder="Ex.: Prefeitura Municipal de ..." />
        </Campo>
        <Campo label="Nº do contrato">
          <input className={inputClasse} value={form.numero_contrato} onChange={set("numero_contrato")} />
        </Campo>
        <Campo label="Nº do processo">
          <input className={inputClasse} value={form.processo} onChange={set("processo")} />
        </Campo>
        <Campo label="Valor do contrato (R$) *" dica="Valor global com BDI, como assinado.">
          <input required inputMode="decimal" className={inputClasse} value={form.valor_contrato} onChange={set("valor_contrato")} placeholder="1.250.000,00" />
        </Campo>
        <Campo label="Objeto" className="md:col-span-2">
          <textarea rows={2} className={inputClasse} value={form.objeto} onChange={set("objeto")} />
        </Campo>
        <Campo label="BDI (%)" dica="Percentual de BDI da proposta.">
          <input inputMode="decimal" className={inputClasse} value={form.bdi_percent} onChange={set("bdi_percent")} placeholder="25" />
        </Campo>
        <Campo label="Reajuste já concedido/previsto (%)" dica="Índice contratual (ex.: INCC) já aplicado. É descontado do impacto — reequilíbrio cobre só o que passa disso.">
          <input inputMode="decimal" className={inputClasse} value={form.reajuste_percent} onChange={set("reajuste_percent")} placeholder="0" />
        </Campo>
        <Campo label="Data-base do orçamento" dica="Data da proposta. Os preços orçados valem para esta data.">
          <input type="date" className={inputClasse} value={form.data_base} onChange={set("data_base")} />
        </Campo>
        <Campo label="Início da obra">
          <input type="date" className={inputClasse} value={form.data_inicio} onChange={set("data_inicio")} />
        </Campo>
        <Campo label="Prazo (meses)">
          <input inputMode="numeric" className={inputClasse} value={form.prazo_meses} onChange={set("prazo_meses")} />
        </Campo>
        <Campo label="Participação sobre o lucro (%)" dica="Remuneração variável de assessoria sobre o lucro apurado (ex.: 10). Deixe vazio se não houver.">
          <input inputMode="decimal" className={inputClasse} value={form.participacao_lucro_percent} onChange={set("participacao_lucro_percent")} placeholder="10" />
        </Campo>
      </div>
      {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={salvando} className={botaoPrimario}>
          {salvando ? "Salvando..." : textoBotao}
        </button>
      </div>
    </form>
  );
}
