export default function EmptyState({ mensagem = "Nenhum registro encontrado." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-gray-400">
      <span className="text-3xl">🗂️</span>
      <p className="text-sm">{mensagem}</p>
    </div>
  );
}
