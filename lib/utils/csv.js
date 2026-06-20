// Gera e baixa um CSV a partir de um array de objetos.
// columns: [{ key: "fornecedor", label: "Fornecedor" }, ...]
export function exportarCSV(nomeArquivo, linhas, columns) {
  if (!linhas?.length) return;

  const cabecalho = columns.map((c) => `"${c.label.replace(/"/g, '""')}"`).join(";");

  const corpo = linhas
    .map((linha) =>
      columns
        .map((c) => {
          const valor = linha[c.key];
          const texto = valor === null || valor === undefined ? "" : String(valor);
          return `"${texto.replace(/"/g, '""')}"`;
        })
        .join(";")
    )
    .join("\n");

  const csv = `${cabecalho}\n${corpo}`;
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = nomeArquivo.endsWith(".csv") ? nomeArquivo : `${nomeArquivo}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
