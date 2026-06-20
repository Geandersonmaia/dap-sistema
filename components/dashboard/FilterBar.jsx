// filtros: [{ key: "status", label: "Status", options: ["Todos", "Ativa", ...] }]
export default function FilterBar({ filtros, valores, onChange }) {
  if (!filtros?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {filtros.map((f) => (
        <select
          key={f.key}
          value={valores[f.key] || "Todos"}
          onChange={(e) => onChange(f.key, e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-gray-400 focus:outline-none"
        >
          {f.options.map((opt) => (
            <option key={opt} value={opt}>
              {f.label}: {opt}
            </option>
          ))}
        </select>
      ))}
    </div>
  );
}
