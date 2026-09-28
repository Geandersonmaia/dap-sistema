export function Campo({ label, dica, children, className = "" }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-gray-600">{label}</span>
      {children}
      {dica && <span className="mt-1 block text-[11px] text-gray-400">{dica}</span>}
    </label>
  );
}

export const inputClasse =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-slate-600 focus:outline-none focus:ring-1 focus:ring-slate-600";

export const botaoPrimario =
  "rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 disabled:opacity-50";

export const botaoSecundario =
  "rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50";
