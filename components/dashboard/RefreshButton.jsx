export default function RefreshButton({ onClick, atualizadoEm, carregando }) {
  return (
    <div className="flex items-center gap-3">
      {atualizadoEm && (
        <span className="text-xs text-gray-400">
          Atualizado em {new Date(atualizadoEm).toLocaleString("pt-BR")}
        </span>
      )}
      <button
        onClick={onClick}
        disabled={carregando}
        className="rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50"
      >
        {carregando ? "Atualizando..." : "↻ Atualizar dados"}
      </button>
    </div>
  );
}
