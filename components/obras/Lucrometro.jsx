import { formatarBRL, formatarPct } from "@/lib/obras/calculos";

// Velocímetro de margem: ponteiro na margem atual, marca tracejada na margem prevista no orçamento.
const MIN = -0.3;
const MAX = 0.3;

const STATUS = {
  prejuizo: { cor: "#d03b3b", fundo: "bg-red-50", texto: "text-red-700", icone: "🔻", label: "PREJUÍZO" },
  atencao: { cor: "#fab219", fundo: "bg-amber-50", texto: "text-amber-800", icone: "⚠️", label: "MARGEM APERTADA" },
  lucro: { cor: "#0ca30c", fundo: "bg-green-50", texto: "text-green-800", icone: "✅", label: "LUCRO" },
  sem_dados: { cor: "#898781", fundo: "bg-gray-50", texto: "text-gray-600", icone: "⏳", label: "SEM MEDIÇÕES AINDA" },
};

function angulo(valor) {
  const v = Math.min(MAX, Math.max(MIN, valor));
  return Math.PI * (1 - (v - MIN) / (MAX - MIN)); // π (esquerda) → 0 (direita)
}

function ponto(cx, cy, r, a) {
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

function arco(cx, cy, r, de, ate) {
  const [x1, y1] = ponto(cx, cy, r, angulo(de));
  const [x2, y2] = ponto(cx, cy, r, angulo(ate));
  return `M ${x1} ${y1} A ${r} ${r} 0 0 1 ${x2} ${y2}`;
}

export default function Lucrometro({ margem, margemOrcada, situacao, resultado, titulo = "Lucrômetro", compacto = false }) {
  const st = STATUS[situacao] || STATUS.sem_dados;
  const cx = 150;
  const cy = 140;
  const r = 110;
  const temValor = margem !== null && margem !== undefined;
  const aPonteiro = angulo(temValor ? margem : 0);
  const [px, py] = ponto(cx, cy, r - 22, aPonteiro);
  const zonas = [
    { de: MIN, ate: -0.002, cor: "#d03b3b" },
    { de: 0.002, ate: 0.048, cor: "#fab219" },
    { de: 0.052, ate: MAX, cor: "#0ca30c" },
  ];

  return (
    <div className={`rounded-xl border border-gray-200 bg-white p-5 shadow-sm ${compacto ? "" : "h-full"}`}>
      <p className="text-sm font-medium text-gray-700">{titulo}</p>
      <svg viewBox="0 0 300 170" className="mx-auto mt-2 w-full max-w-sm" role="img" aria-label={`${st.label}: margem de ${formatarPct(margem)}`}>
        {zonas.map((z) => (
          <path key={z.cor} d={arco(cx, cy, r, z.de, z.ate)} stroke={z.cor} strokeWidth="18" fill="none" strokeLinecap="butt" opacity={0.85} />
        ))}
        {[-0.3, -0.15, 0, 0.15, 0.3].map((t) => {
          const [x1, y1] = ponto(cx, cy, r + 12, angulo(t));
          const [lx, ly] = ponto(cx, cy, r + 24, angulo(t));
          return (
            <g key={t}>
              <circle cx={x1} cy={y1} r="1.5" fill="#898781" />
              <text x={lx} y={ly + 3} textAnchor="middle" fontSize="10" fill="#898781">
                {Math.round(t * 100)}%
              </text>
            </g>
          );
        })}
        {margemOrcada !== null && margemOrcada !== undefined && (
          (() => {
            const [x1, y1] = ponto(cx, cy, r - 14, angulo(margemOrcada));
            const [x2, y2] = ponto(cx, cy, r + 14, angulo(margemOrcada));
            return (
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#0b0b0b" strokeWidth="2" strokeDasharray="3 2">
                <title>Margem prevista no orçamento: {formatarPct(margemOrcada)}</title>
              </line>
            );
          })()
        )}
        {temValor && (
          <>
            <line x1={cx} y1={cy} x2={px} y2={py} stroke="#0b0b0b" strokeWidth="4" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="8" fill="#0b0b0b" />
          </>
        )}
      </svg>
      <div className="-mt-2 text-center">
        <p className="text-4xl font-bold text-gray-900">{temValor ? formatarPct(margem) : "—"}</p>
        {resultado !== undefined && temValor && (
          <p className="text-sm text-gray-500">
            {resultado >= 0 ? "Lucro" : "Prejuízo"} de {formatarBRL(Math.abs(resultado))}
          </p>
        )}
        <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${st.fundo} ${st.texto}`}>
          {st.icone} {st.label}
        </span>
        {margemOrcada !== null && margemOrcada !== undefined && !compacto && (
          <p className="mt-2 text-xs text-gray-400">┆ tracejado = margem prevista no orçamento ({formatarPct(margemOrcada)})</p>
        )}
      </div>
    </div>
  );
}
