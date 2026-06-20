const CORES = {
  azul: "text-[#1e3a6e]",
  verde: "text-green-600",
  amarelo: "text-amber-600",
  vermelho: "text-red-600",
  cinza: "text-gray-900",
};

export default function StatCard({ titulo, valor, subtitulo, cor = "cinza", icone }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-gray-500">{titulo}</p>
        {icone && <span className="text-lg">{icone}</span>}
      </div>
      <p className={`mt-1 text-3xl font-semibold ${CORES[cor] || CORES.cinza}`}>{valor}</p>
      {subtitulo && <p className="mt-1 text-xs text-gray-400">{subtitulo}</p>}
    </div>
  );
}
