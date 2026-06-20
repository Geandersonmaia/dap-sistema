const ESTILOS = {
  "🟢": "border-green-300 bg-green-50 text-green-700",
  "🟡": "border-amber-300 bg-amber-50 text-amber-700",
  "🟠": "border-orange-300 bg-orange-50 text-orange-700",
  "🔴": "border-red-300 bg-red-50 text-red-700",
  "✅": "border-green-300 bg-green-50 text-green-700",
  "⚖️": "border-purple-300 bg-purple-50 text-purple-700",
  "📨": "border-blue-300 bg-blue-50 text-blue-700",
};

export default function StatusBadge({ texto }) {
  if (!texto) return <span className="text-xs text-gray-400">—</span>;

  const emoji = Object.keys(ESTILOS).find((e) => texto.startsWith(e));
  const estilo = ESTILOS[emoji] || "border-gray-300 bg-gray-50 text-gray-700";

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${estilo}`}>
      {texto}
    </span>
  );
}
