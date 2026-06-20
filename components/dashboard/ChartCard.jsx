export default function ChartCard({ titulo, children, altura = 280 }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <p className="mb-3 text-sm font-medium text-gray-700">{titulo}</p>
      <div style={{ width: "100%", height: altura }}>{children}</div>
    </div>
  );
}
