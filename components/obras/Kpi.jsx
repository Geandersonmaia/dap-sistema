const CORES = {
  azul: "text-[#1e3a6e]",
  verde: "text-green-700",
  vermelho: "text-red-700",
  cinza: "text-gray-900",
};

// Card de número compacto: cabe valores em reais de 7 dígitos em colunas estreitas.
export default function Kpi({ titulo, valor, subtitulo, cor = "cinza" }) {
  return (
    <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <p className="truncate text-xs font-medium text-gray-500">{titulo}</p>
      <p className={`mt-1 overflow-hidden text-lg font-semibold leading-tight sm:text-xl tabular-nums ${CORES[cor] || CORES.cinza}`}>{valor}</p>
      {subtitulo && <p className="mt-0.5 truncate text-[11px] text-gray-400">{subtitulo}</p>}
    </div>
  );
}
