"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/dashboard/Header";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

function menuDaObra(id) {
  const base = `/obras/${id}`;
  return [
    { href: base, label: "Painel da obra", icone: "📊" },
    { href: `${base}/lancamentos`, label: "Lançar gastos", icone: "🧾" },
    { href: `${base}/orcamento`, label: "Orçamento contratado", icone: "📐" },
    { href: `${base}/medicoes`, label: "Medições (receita)", icone: "💵" },
    { href: `${base}/relatorio`, label: "Relatório de reequilíbrio", icone: "⚖️" },
    { href: `${base}/contrato`, label: "Dados do contrato", icone: "📄" },
  ];
}

export default function ObrasLayout({ titulo, obraId, nomeObra, children, acoes }) {
  const [aberta, setAberta] = useState(false);
  const pathname = usePathname();
  useInactivityLogout(30);

  const itens = obraId ? menuDaObra(obraId) : [];

  const link = (item) => {
    const ativo = pathname === item.href;
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setAberta(false)}
        className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
          ativo ? "bg-slate-800 text-white" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        }`}
      >
        <span>{item.icone}</span>
        {item.label}
      </Link>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50 print:block print:bg-white">
      {aberta && <div className="fixed inset-0 z-30 bg-black/30 md:hidden print:hidden" onClick={() => setAberta(false)} />}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform md:static md:translate-x-0 print:hidden ${
          aberta ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-gray-100 px-6 py-6">
          <p className="text-2xl">🏗️</p>
          <p className="mt-1 text-sm font-bold leading-tight text-slate-800">Controle de Obras</p>
          <p className="text-[11px] leading-tight text-gray-400">Custos, lucro e reequilíbrio</p>
        </div>
        <nav className="px-3 py-4">
          {link({ href: "/obras", label: "Todas as obras", icone: "🏗️" })}
          {obraId && (
            <>
              <p className="mb-2 mt-4 truncate px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                {nomeObra || "Obra"}
              </p>
              {itens.map(link)}
            </>
          )}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="print:hidden">
          <Header titulo={titulo} onAbrirMenu={() => setAberta(true)} />
        </div>
        <main className="flex-1 p-4 md:p-6 print:p-0">
          {acoes && <div className="mb-4 flex flex-wrap justify-end gap-2 print:hidden">{acoes}</div>}
          {children}
        </main>
      </div>
    </div>
  );
}
