"use client";

import { useMemo, useState } from "react";
import ObrasLayout from "@/components/obras/ObrasLayout";
import DataTable from "@/components/dashboard/DataTable";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import Kpi from "@/components/obras/Kpi";
import { Campo, inputClasse, botaoPrimario } from "@/components/obras/Campo";
import { chamarAPI, useObra } from "@/hooks/useObra";
import { CATEGORIAS } from "@/lib/obras/constants";
import { formatarBRL, formatarData, formatarNumero, labelCategoria } from "@/lib/obras/calculos";

const hoje = () => new Date().toLocaleDateString("sv-SE"); // AAAA-MM-DD no fuso local

const numeroBR = (v) => {
  if (v === "" || v === null || v === undefined) return null;
  const s = String(v).trim();
  const x = Number(s.includes(",") ? s.replace(/\./g, "").replace(",", ".") : s);
  return Number.isFinite(x) ? x : null;
};

function novoForm(anterior) {
  return {
    data: anterior?.data || hoje(),
    categoria: anterior?.categoria || "material",
    item_id: "",
    descricao: "",
    quantidade: "",
    unidade: "",
    valor_unitario: "",
    valor_total: "",
    fornecedor: anterior?.fornecedor || "",
    documento: "",
    observacao: "",
  };
}

function FormLancamento({ obraId, itens, onSalvo }) {
  const [form, setForm] = useState(() => novoForm());
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState(null);

  const itensDaCategoria = useMemo(() => itens.filter((i) => i.categoria === form.categoria), [itens, form.categoria]);

  function set(k, v) {
    setForm((f) => {
      const novo = { ...f, [k]: v };
      if (k === "item_id") {
        const item = itens.find((i) => String(i.id) === v);
        if (item) {
          novo.descricao = item.descricao;
          novo.unidade = item.unidade || "";
        }
      }
      if (k === "categoria") novo.item_id = "";
      if (k === "quantidade" || k === "valor_unitario") {
        const q = numeroBR(novo.quantidade);
        const pu = numeroBR(novo.valor_unitario);
        if (q !== null && pu !== null) novo.valor_total = (q * pu).toFixed(2).replace(".", ",");
      }
      return novo;
    });
  }

  async function enviar(e) {
    e.preventDefault();
    setSalvando(true);
    setMsg(null);
    try {
      const { valor_unitario, ...corpo } = form;
      await chamarAPI(`/api/obras/${obraId}/lancamentos`, {
        method: "POST",
        body: { ...corpo, item_id: form.item_id || null },
      });
      setMsg({ ok: true, texto: `Lançado: ${form.descricao} — R$ ${form.valor_total}` });
      setForm(novoForm(form));
      onSalvo();
    } catch (err) {
      setMsg({ ok: false, texto: err.message });
    } finally {
      setSalvando(false);
    }
  }

  const item = itens.find((i) => String(i.id) === form.item_id);
  const puDigitado = numeroBR(form.valor_unitario) ?? (numeroBR(form.valor_total) && numeroBR(form.quantidade) ? numeroBR(form.valor_total) / numeroBR(form.quantidade) : null);
  const variacao = item && puDigitado && item.preco_unitario > 0 ? puDigitado / item.preco_unitario - 1 : null;

  return (
    <form onSubmit={enviar} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-800">Novo gasto</p>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Campo label="Data *">
          <input type="date" required className={inputClasse} value={form.data} onChange={(e) => set("data", e.target.value)} />
        </Campo>
        <Campo label="Categoria *">
          <select className={inputClasse} value={form.categoria} onChange={(e) => set("categoria", e.target.value)}>
            {CATEGORIAS.map((c) => (
              <option key={c.valor} value={c.valor}>
                {c.icone} {c.label}
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Item do orçamento" className="col-span-2" dica="Vincule sempre que possível — é o que prova a variação de preço.">
          <select className={inputClasse} value={form.item_id} onChange={(e) => set("item_id", e.target.value)}>
            <option value="">— sem vínculo —</option>
            {itensDaCategoria.map((i) => (
              <option key={i.id} value={i.id}>
                {i.codigo ? `${i.codigo} · ` : ""}
                {i.descricao} ({i.unidade || "un"} a {formatarBRL(i.preco_unitario)})
              </option>
            ))}
          </select>
        </Campo>
        <Campo label="Descrição *" className="col-span-2">
          <input required className={inputClasse} value={form.descricao} onChange={(e) => set("descricao", e.target.value)} placeholder="Ex.: Aço CA-50 10mm" />
        </Campo>
        <Campo label="Quantidade">
          <input inputMode="decimal" className={inputClasse} value={form.quantidade} onChange={(e) => set("quantidade", e.target.value)} />
        </Campo>
        <Campo label="Unidade">
          <input className={inputClasse} value={form.unidade} onChange={(e) => set("unidade", e.target.value)} placeholder="kg, saco, m³, h..." />
        </Campo>
        <Campo label="Valor unitário (R$)">
          <input inputMode="decimal" className={inputClasse} value={form.valor_unitario} onChange={(e) => set("valor_unitario", e.target.value)} />
        </Campo>
        <Campo label="Valor total (R$) *">
          <input required inputMode="decimal" className={inputClasse} value={form.valor_total} onChange={(e) => set("valor_total", e.target.value)} />
        </Campo>
        <Campo label="Fornecedor">
          <input className={inputClasse} value={form.fornecedor} onChange={(e) => set("fornecedor", e.target.value)} />
        </Campo>
        <Campo label="Nota fiscal / recibo">
          <input className={inputClasse} value={form.documento} onChange={(e) => set("documento", e.target.value)} placeholder="NF 12345" />
        </Campo>
        <Campo label="Observação" className="col-span-2 md:col-span-4">
          <input className={inputClasse} value={form.observacao} onChange={(e) => set("observacao", e.target.value)} />
        </Campo>
      </div>
      {variacao !== null && (
        <p className={`rounded-lg px-3 py-2 text-sm ${variacao > 0.05 ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}>
          {variacao > 0 ? "▲" : "▼"} Preço {Math.abs(variacao * 100).toFixed(1)}% {variacao > 0 ? "acima" : "abaixo"} do orçado ({formatarBRL(item.preco_unitario)}/{item.unidade || "un"})
        </p>
      )}
      {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.texto}</p>}
      <div className="flex justify-end">
        <button type="submit" disabled={salvando} className={botaoPrimario}>
          {salvando ? "Salvando..." : "Lançar gasto"}
        </button>
      </div>
    </form>
  );
}

export default function LancamentosPage({ params }) {
  const { dados, erro, recarregar } = useObra(params.id);

  async function excluir(l) {
    if (!confirm(`Excluir o lançamento "${l.descricao}" de ${formatarBRL(l.valor_total)}?`)) return;
    await chamarAPI(`/api/obras/${params.id}/lancamentos/${l.id}`, { method: "DELETE" });
    recarregar();
  }

  const itensPorId = Object.fromEntries((dados?.itens || []).map((i) => [i.id, i]));

  return (
    <ObrasLayout titulo="Lançar gastos" obraId={params.id} nomeObra={dados?.obra?.nome}>
      {erro && <ErrorState mensagem={erro} onRetry={recarregar} />}
      {!dados && !erro && <LoadingState />}
      {dados && (
        <div className="space-y-6">
          <FormLancamento obraId={params.id} itens={dados.itens} onSalvo={recarregar} />

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi titulo="Total gasto" valor={formatarBRL(dados.analise.custoReal)} />
            <Kpi titulo="Lançamentos" valor={dados.lancamentos.length} />
            {dados.analise.porCategoria.slice(0, 2).map((c) => (
              <Kpi key={c.categoria} titulo={c.label} valor={formatarBRL(c.real)} />
            ))}
          </div>

          <DataTable
            exportFilename={`gastos-obra-${params.id}`}
            pageSize={25}
            data={dados.lancamentos}
            columns={[
              { key: "data", label: "Data", render: (l) => formatarData(l.data) },
              { key: "categoria", label: "Categoria", render: (l) => labelCategoria(l.categoria), csvValue: (l) => labelCategoria(l.categoria) },
              {
                key: "descricao",
                label: "Descrição",
                render: (l) => (
                  <span>
                    {l.descricao}
                    {l.item_id && itensPorId[l.item_id] ? (
                      <span className="ml-1 text-[11px] text-slate-500">🔗 orçamento</span>
                    ) : null}
                  </span>
                ),
              },
              { key: "quantidade", label: "Qtd.", render: (l) => (l.quantidade ? `${formatarNumero(l.quantidade)} ${l.unidade || ""}` : "—") },
              {
                key: "unitario",
                label: "Unitário",
                sortable: false,
                render: (l) => (l.quantidade ? formatarBRL(l.valor_total / l.quantidade) : "—"),
                csvValue: (l) => (l.quantidade ? (l.valor_total / l.quantidade).toFixed(4) : ""),
              },
              { key: "valor_total", label: "Total", render: (l) => formatarBRL(l.valor_total) },
              { key: "fornecedor", label: "Fornecedor" },
              { key: "documento", label: "NF/Recibo" },
              {
                key: "acoes",
                label: "",
                sortable: false,
                csvValue: () => "",
                render: (l) => (
                  <button onClick={() => excluir(l)} className="text-xs text-red-600 hover:underline">
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
