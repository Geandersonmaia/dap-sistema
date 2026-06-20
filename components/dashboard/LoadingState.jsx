export default function LoadingState({ texto = "Carregando dados..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-gray-400">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-[#1e3a6e]" />
      <p className="text-sm">{texto}</p>
    </div>
  );
}
