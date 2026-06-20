"use client";

import { useMemo, useState } from "react";
import { exportarCSV } from "@/lib/utils/csv";
import EmptyState from "./EmptyState";

// columns: [{ key, label, render?: (linha) => node, sortable?: boolean, csvValue?: (linha) => string|number }]
export default function DataTable({ columns, data, exportFilename, pageSize = 15, linhaClasse }) {
  const [ordenarPor, setOrdenarPor] = useState(null);
  const [ordemAsc, setOrdemAsc] = useState(true);
  const [pagina, setPagina] = useState(1);

  const dadosOrdenados = useMemo(() => {
    if (!ordenarPor) return data;
    const copia = [...data];
    copia.sort((a, b) => {
      const va = a[ordenarPor];
      const vb = b[ordenarPor];
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return ordemAsc ? va - vb : vb - va;
      return ordemAsc ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
    return copia;
  }, [data, ordenarPor, ordemAsc]);

  const totalPaginas = Math.max(1, Math.ceil(dadosOrdenados.length / pageSize));
  const paginaAtual = Math.min(pagina, totalPaginas);
  const dadosPagina = dadosOrdenados.slice((paginaAtual - 1) * pageSize, paginaAtual * pageSize);

  function alternarOrdenacao(key) {
    if (ordenarPor === key) {
      setOrdemAsc((v) => !v);
    } else {
      setOrdenarPor(key);
      setOrdemAsc(true);
    }
  }

  function handleExport() {
    const cols = columns.map((c) => ({ key: c.key, label: c.label }));
    const linhas = dadosOrdenados.map((linha) => {
      const obj = {};
      columns.forEach((c) => {
        obj[c.key] = c.csvValue ? c.csvValue(linha) : linha[c.key];
      });
      return obj;
    });
    exportarCSV(exportFilename || "exportacao", linhas, cols);
  }

  if (!data?.length) return <EmptyState />;

  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5">
        <p className="text-xs text-gray-400">{dadosOrdenados.length} registro(s)</p>
        {exportFilename && (
          <button onClick={handleExport} className="text-xs font-medium text-[#1e3a6e] hover:underline">
            ⬇ Exportar CSV
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-left text-xs text-gray-500">
              {columns.map((c) => (
                <th
                  key={c.key}
                  onClick={() => c.sortable !== false && alternarOrdenacao(c.key)}
                  className={`whitespace-nowrap px-4 py-2.5 font-medium ${
                    c.sortable !== false ? "cursor-pointer hover:text-gray-700" : ""
                  }`}
                >
                  {c.label}
                  {ordenarPor === c.key && (ordemAsc ? " ↑" : " ↓")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dadosPagina.map((linha, i) => (
              <tr
                key={linha.id || i}
                className={`border-b border-gray-50 last:border-0 hover:bg-gray-50 ${linhaClasse ? linhaClasse(linha) : ""}`}
              >
                {columns.map((c) => (
                  <td key={c.key} className="whitespace-nowrap px-4 py-2.5 text-gray-700">
                    {c.render ? c.render(linha) : linha[c.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPaginas > 1 && (
        <div className="flex items-center justify-between border-t border-gray-100 px-4 py-2.5 text-xs text-gray-500">
          <span>
            Página {paginaAtual} de {totalPaginas}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
              disabled={paginaAtual === 1}
              className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40"
            >
              ‹
            </button>
            <button
              onClick={() => setPagina((p) => Math.min(totalPaginas, p + 1))}
              disabled={paginaAtual === totalPaginas}
              className="rounded border border-gray-200 px-2 py-1 disabled:opacity-40"
            >
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
