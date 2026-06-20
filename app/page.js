import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-50 p-8 text-center">
      <h1 className="text-3xl font-semibold text-gray-900">Sistema DAP — SEMUSA</h1>
      <p className="max-w-md text-gray-500">
        Escolha um módulo abaixo. O Painel mostra KPIs e alertas em tempo real; a Consulta
        Inteligente responde perguntas em linguagem natural sobre atas, itens, gerenciamentos,
        liquidações e implantações.
      </p>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/painel"
          className="rounded-lg bg-gray-900 px-6 py-3 font-medium text-white hover:bg-gray-800"
        >
          📊 Painel de Controle
        </Link>
        <Link
          href="/chat"
          className="rounded-lg border border-gray-300 px-6 py-3 font-medium text-gray-900 hover:bg-gray-100"
        >
          💬 Consulta Inteligente
        </Link>
      </div>
    </div>
  );
}
