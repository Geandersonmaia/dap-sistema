"use client";

import { useState } from "react";
import ObrasLayout from "@/components/obras/ObrasLayout";
import DataTable from "@/components/dashboard/DataTable";
import LoadingState from "@/components/dashboard/LoadingState";
import ErrorState from "@/components/dashboard/ErrorState";
import Kpi from "@/components/obras/Kpi";
import { Campo, inputClasse, botaoPrimario, botaoSecundario } from "@/components/obras/Campo";
import { chamarAPI, useObra } from "@/hooks/useObra";
import { CATEGORIAS, CATEGORIA_LABEL } from "@/lib/obras/constants";
import { formatarBRL, formatarNumero, formatarPct, labelCategoria } from "@/lib/obras/calculos";

const VAZIO = { codigo: "", categoria: "material", descricao: "", unidade: "", quantidade: "", preco_unitario: "" };

// Aceita o nome da categoria escrito na planilha ("Mão de obra", "material"...).
function detectarCategoria(texto, padrao) {
  const t = String(texto || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
  if (!t) return padrao;
  for (const c of CATEGORIAS) {
    const label = c.label.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    if (t === c.valor || t === label || label.startsWith(t) || t.startsWith(label.split(" ")[0])) return c.valor;
  }
  return padrao;
}

// Colunas coladas do Excel: código | descrição | unidade | quantidade | preço unitário | [categoria]
function interpretarColagem(texto, categoriaPadrao) {
  return texto
    .split(/\r?\n/)
    .map((l) => l.split("\t").map((c) => c.trim()))
    .filter((cols) => cols.length >= 5 && cols[1])
    .filter((cols) => /\d/.test(cols[3]) && /\d/.test(cols[4])) // pula cabeçalho
    .map((cols) => ({
      codigo: cols[0],
      descricao: cols[1],
      unidade: cols[2],
      quantidade: cols[3],
      preco_unitario: cols[4],
      categoria: detectarCategoria(cols[5], categoriaPadrao),
    }));
}

function Importar({ obraId, onSalvo }) {
  const [aberto, setAberto] = useState(false);
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState("material");
  const [msg, setMsg] = useState(null);
  const linhas = texto ? interpretarColagem(texto, categoria) : [];

  async function importar() {
    try {
      await chamarAPI(`/api/obras/${obraId}/itens`, { method: "POST", body: linhas });
      setMsg({ ok: true, texto: `${linhas.length} itens importados.` });
      setTexto("");
      onSalvo();
    } catch (e) {
      setMsg({ ok: false, texto: e.message });
    }
  }

  if (!aberto) {
    return (
      <button onClick={() => setAberto(true)} className={botaoSecundario}>
        📋 Colar planilha do Excel
      </button>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-semibold text-gray-800">Importar da planilha orçamentária</p>
      <p className="text-xs text-gray-500">
        No Excel, selecione as colunas nesta ordem: <b>Código · Descrição · Unidade · Quantidade · Preço unitário (sem BDI)</b> e,
        opcionalmente, <b>Categoria</b>. Copie (Ctrl+C) e cole abaixo (Ctrl+V).
      </p>
      <Campo label="Categoria para linhas sem categoria">
        <select className={`${inputClasse} max-w-xs`} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
          {CATEGORIAS.map((c) => (
            <option key={c.valor} value={c.valor}>
              {c.label}
            </option>
          ))}
        </select>
      </Campo>
      <textarea rows={8} className={`${inputClasse} font-mono text-xs`} value={texto} onChange={(e) => setTexto(e.target.value)} placeholder={"1.1\tAço CA-50 10mm\tkg\t12.500\t7,85\tMaterial"} />
      {linhas.length > 0 && (
        <p className="text-xs text-gray-600">
          {linhas.length} linha(s) reconhecida(s). Total: {formatarBRL(linhas.reduce((a, l) => a + (Number(String(l.quantidade).replace(/\./g, "").replace(",", ".")) || 0) * (Number(String(l.preco_unitario).replace(/\./g, "").replace(",", ".")) || 0), 0))}
        </p>
      )}
      {msg && <p className={`rounded-lg px-3 py-2 text-sm ${msg.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>{msg.texto}</p>}
      <div className="flex justify-end gap-2">
        <button onClick={() => setAberto(false)} className={botaoSecundario}>
          Fechar
        </button>
        <button onClick={importar} disabled={!linhas.length} className={botaoPrimario}>
          Importar {linhas.length || ""} itens
        </button>
      </div>
    </div>
  );
}

export default function OrcamentoPage({ params }) {
  const { dados, erro, recarregar } = useObra(params.id);
  const [form, setForm] = useState(VAZIO);
  const [msg, setMsg] = useState(null);

  async function adicionar(e) {
    e.preventDefault();
    try {
      await chamarAPI(`/api/obras/${params.id}/itens`, { method: "POST", body: form });
      setForm({ ...VAZIO, categoria: form.categoria });
      setMsg(null);
      recarregar();
    } catch (err) {
      setMsg(err.message);
    }
  }

  async function excluir(i) {
    if (!confirm(`Excluir o item "${i.descricao}"? Os gastos vinculados a ele ficam sem vínculo.`)) return;
    await chamarAPI(`/api/obras/${params.id}/itens/${i.id}`, { method: "DELETE" });
    recarregar();
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const a = dados?.analise;

  return (
    <ObrasLayout titulo="Orçamento contratado" obraId={params.id} nomeObra={dados?.obra?.nome}>
      {erro && <ErrorState mensagem={erro} onRetry={recarregar} />}
      {!dados && !erro && <LoadingState />}
      {dados && (
        <div className="space-y-6">
          <p className="rounded-lg bg-slate-50 px-4 py-3 text-sm text-slate-700">
            Cadastre aqui os insumos e serviços <b>com os preços da proposta (data-base)</b>, sem BDI. É contra esses preços que
            o sistema compara o que está sendo pago hoje — a diferença é o desequilíbrio.
          </p>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi titulo="Itens" valor={dados.itens.length} />
            <Kpi titulo="Custo direto orçado" valor={formatarBRL(a.custoOrcadoPlanilha)} />
            <Kpi titulo="Valor do contrato" valor={formatarBRL(a.valorContrato)} />
            <Kpi
              titulo="Margem implícita"
              valor={formatarPct(a.margemOrcada)}
              subtitulo={a.custoOrcadoPlanilha ? "(contrato − custo direto) ÷ contrato" : "Sem planilha: estimado pelo BDI"}
            />
          </div>

          <Importar obraId={params.id} onSalvo={recarregar} />

          <form onSubmit={adicionar} className="grid grid-cols-2 items-end gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm md:grid-cols-7">
            <Campo label="Código">
              <input className={inputClasse} value={form.codigo} onChange={set("codigo")} />
            </Campo>
            <Campo label="Categoria">
              <select className={inputClasse} value={form.categoria} onChange={set("categoria")}>
                {CATEGORIAS.map((c) => (
                  <option key={c.valor} value={c.valor}>
                    {c.label}
                  </option>
                ))}
              </select>
            </Campo>
            <Campo label="Descrição *" className="col-span-2">
              <input required className={inputClasse} value={form.descricao} onChange={set("descricao")} placeholder="Cimento CP-II 50kg" />
            </Campo>
            <Campo label="Unidade">
              <input className={inputClasse} value={form.unidade} onChange={set("unidade")} placeholder="saco" />
            </Campo>
            <Campo label="Quantidade">
              <input inputMode="decimal" className={inputClasse} value={form.quantidade} onChange={set("quantidade")} />
            </Campo>
            <Campo label="Preço unit. (R$)">
              <input inputMode="decimal" className={inputClasse} value={form.preco_unitario} onChange={set("preco_unitario")} />
            </Campo>
            {msg && <p className="col-span-full text-sm text-red-700">{msg}</p>}
            <div className="col-span-full flex justify-end">
              <button className={botaoPrimario}>Adicionar item</button>
            </div>
          </form>

          <DataTable
            exportFilename={`orcamento-obra-${params.id}`}
            pageSize={50}
            data={dados.itens.map((i) => ({ ...i, total: i.quantidade * i.preco_unitario }))}
            columns={[
              { key: "codigo", label: "Código" },
              { key: "categoria", label: "Categoria", render: (i) => labelCategoria(i.categoria), csvValue: (i) => CATEGORIA_LABEL[i.categoria] },
              { key: "descricao", label: "Descrição" },
              { key: "unidade", label: "Un." },
              { key: "quantidade", label: "Quantidade", render: (i) => formatarNumero(i.quantidade, 4) },
              { key: "preco_unitario", label: "Preço unit.", render: (i) => formatarBRL(i.preco_unitario) },
              { key: "total", label: "Total", render: (i) => formatarBRL(i.total) },
              {
                key: "acoes",
                label: "",
                sortable: false,
                csvValue: () => "",
                render: (i) => (
                  <button onClick={() => excluir(i)} className="text-xs text-red-600 hover:underline">
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
