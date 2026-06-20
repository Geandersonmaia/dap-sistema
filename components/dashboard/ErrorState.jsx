export default function ErrorState({ mensagem = "Não foi possível carregar os dados.", onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-red-100 bg-red-50 py-12 text-center">
      <p className="max-w-md text-sm text-red-700">{mensagem}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}
