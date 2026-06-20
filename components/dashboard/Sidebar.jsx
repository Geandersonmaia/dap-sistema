"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const ITENS_MENU = [
  { href: "/painel", label: "Painel Geral", icone: "📊" },
  { href: "/painel/atas", label: "Atas", icone: "📄" },
  { href: "/painel/gerenciamentos", label: "Gerenciamentos", icone: "🗂️" },
  { href: "/painel/liquidacoes", label: "Liquidação", icone: "💰" },
  { href: "/painel/fornecedores", label: "Fornecedores", icone: "🏢" },
  { href: "/painel/relatorios", label: "Relatórios", icone: "📈" },
];

export default function Sidebar({ aberta, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {aberta && (
        <div className="fixed inset-0 z-30 bg-black/30 md:hidden" onClick={onClose} />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-gray-200 bg-white transition-transform md:static md:translate-x-0 ${
          aberta ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col items-center gap-2 border-b border-gray-100 px-6 py-6">
          <Image src="/icon-192.png" alt="DAP" width={88} height={88} className="rounded-full" priority />
          <div className="text-center">
            <p className="text-sm font-bold leading-tight text-[#1e3a6e]">DAP Sistema</p>
            <p className="text-[11px] leading-tight text-gray-400">SEMUSA Porto Velho</p>
          </div>
        </div>

        <nav className="px-3 py-4">
          {ITENS_MENU.map((item) => {
            const ativo = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  ativo
                    ? "bg-[#1e3a6e] text-white"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <span>{item.icone}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
