"use client";

import { useState } from "react";
import ObrasLayout from "@/components/obras/ObrasLayout";
import DataTable from "@/components/dashboard/DataTable";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import Kpi from "@/components/obras/Kpi";
import { Campo, inputClasse, botaoPrimario } from "@/components/obras/Campo";
import { chamarAPI, useObra } from "@/hooks/useObra";
import { formatarBRL, formatarData, formatarPct } from "@/lib/obras/calculos";
import { TIPOS_RECEITA, TIPO_RECEITA_LABEL } from "@/lib/obras/constants";

const VAZIO = { tipo: "medicao", numero: "", data: "", valor: "", tributos_retidos: "", glosa: "", data_pagamento: "", observacao: "" };

export default function MedicoesPage({ params }) {
  const { dados, erro, recarregar } = useObra(params.id);
  const [form, setForm] = useState(VAZIO);
  const [msg, setMsg] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function adicionar(e) {
    e.preventDefault();
    try {
      await chamarAPI(`/api/obras/${params.id}/medicoes`, { method: "POST", body: form });
      setForm(VAZIO);
      setMsg(null);
      recarregar();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function marcarPaga(m) {
    const data = prompt("Data do pagamento (AAAA-MM-DD):", new Date().toLocaleDateString("sv-SE"));
    if (!data) return;
    await chamarAPI(`/api/obras/${params.id}/medicoes/${m.id}`, { method: "PUT", body: { data_pagamento: data } });
    recarregar();
  }

  async function excluir(m) {
    if (!confirm(`Excluir a medição ${m.numero || ""} de ${formatarBRL(m.valor)}?`)) return;
    await chamarAPI(`/api/obras/${params.id}/medicoes/${m.id}`, { method: "DELETE" });
    recarregar();
  }

  const a = dados?.analise;

  return (
    <ObrasLayout titulo="Medições (receita)" obraId={params.id} nomeObra={dados?.obra?.nome}>
      {erro && <ErrorState mensagem={erro} onRetry={recarregar} />}
      {!dados && !erro && <LoadingState />}
      {dados && (
        <div className="space-y-6">
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Cada boletim de medição aprovado pelo órgão é a receita da obra. Informe o valor medido e, quando cair na conta, a data do pagamento.
          </p>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi titulo="Receita total (− glosas)" valor={formatarBRL(a.receitaMedida)} cor="azul" />
            <Kpi titulo="Executado" valor={formatarPct(a.execucao)} subtitulo={`de ${formatarBRL(a.valorContrato)}`} />
            <Kpi titulo="Recebido" valor={formatarBRL(a.receitaRecebida)} cor="verde" />
            <Kpi titulo="A receber" valor={formatarBRL(a.receitaMedida - a.receitaRecebida)} cor="cinza" />
          </div>

          <form onSubmit={adicionar} className="grid grid-cols-2 items-start gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-4">
            <Campo label="Tipo">
              <select className={inputClasse} value={form.tipo} onChange={set("tipo")}>
                {TIPOS_RECEITA.map((t) => (
                  <option key={t.valor} value={t.valor}>
                    {t.label}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Nº da medição">
              <input className={inputClasse} value={form.numero} onChange={set("numero")} placeholder="3ª" />
            </Campo>
            <Campo label="Data (fim do período) *">
              <input type="date" required className={inputClasse} value={form.data} onChange={set("data")} />
            </Campo>
            <Campo label="Valor bruto (R$) *" dica="Antes das retenções.">
              <input required inputMode="decimal" className={inputClasse} value={form.valor} onChange={set("valor")} />
            </Campo>
            <Campo label="Tributos retidos (R$)" dica="ISS, INSS, IR etc. retidos pelo órgão.">
              <input inputMode="decimal" className={inputClasse} value={form.tributos_retidos} onChange={set("tributos_retidos")} />
            </Campo>
            <Campo label="Glosa / multa descontada (R$)">
              <input inputMode="decimal" className={inputClasse} value={form.glosa} onChange={set("glosa")} />
            </Campo>
            <Campo label="Pago em">
              <input type="date" className={inputClasse} value={form.data_pagamento} onChange={set("data_pagamento")} />
            </Campo>
            <Campo label="Observação">
              <input className={inputClasse} value={form.observacao} onChange={set("observacao")} />
            </Campo>
            {msg && <p className="col-span-full text-sm text-red-700">{msg}</p>}
            <div className="col-span-full flex justify-end">
              <button className={botaoPrimario}>Adicionar medição</button>
            </div>
          </form>

          <DataTable
            exportFilename={`medicoes-obra-${params.id}`}
            data={dados.medicoes}
            columns={[
              { key: "tipo", label: "Tipo", render: (m) => TIPO_RECEITA_LABEL[m.tipo] || "Medição", csvValue: (m) => TIPO_RECEITA_LABEL[m.tipo] || "Medição" },
              { key: "numero", label: "Nº" },
              { key: "data", label: "Data", render: (m) => formatarData(m.data) },
              { key: "valor", label: "Valor bruto", render: (m) => formatarBRL(m.valor) },
              { key: "tributos_retidos", label: "Tributos retidos", render: (m) => (m.tributos_retidos ? formatarBRL(m.tributos_retidos) : "—") },
              { key: "glosa", label: "Glosa", render: (m) => (m.glosa ? formatarBRL(m.glosa) : "—") },
              {
                key: "data_pagamento",
                label: "Pagamento",
                render: (m) =>
                  m.data_pagamento ? (
                    <span className="text-green-700">✅ {formatarData(m.data_pagamento)}</span>
                  ) : (
                    <button onClick={() => marcarPaga(m)} className="text-xs text-slate-700 underline">
                      ⏳ marcar como paga
                    </button>
                  ),
                csvValue: (m) => m.data_pagamento || "",
              },
              { key: "observacao", label: "Observação" },
              {
                key: "acoes",
                label: "",
                sortable: false,
                csvValue: () => "",
                render: (m) => (
                  <button onClick={() => excluir(m)} className="text-xs text-red-600 hover:underline">
                    Excluir
                  </button>
                ),
              },
            ]}
          />
        </div>
      )}
    </ObrasLayout>
  );
}
