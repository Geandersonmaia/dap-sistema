const ESTILO = {
  critico: { classe: "border-red-200 bg-red-50 text-red-800", icone: "🔴" },
  atencao: { classe: "border-amber-200 bg-amber-50 text-amber-900", icone: "🟡" },
};

export default function Alertas({ alertas }) {
  if (!alertas?.length) return null;
  return (
    <div className="space-y-2">
      {alertas.map((a, i) => {
        const e = ESTILO[a.nivel] || ESTILO.atencao;
        return (
          <div key={i} className={`flex gap-2 rounded-lg border px-3 py-2 text-sm ${e.classe}`}>
            <span>{e.icone}</span>
            <span>{a.texto}</span>
          </div>
        );
      })}
    </div>
  );
}
