import Link from "next/link";
import Brasao from "./Brasao";

const ABAS = [
  { href: "/", rotulo: "Painel" },
  { href: "/missoes/nova", rotulo: "Nova missão" },
  { href: "/equipe", rotulo: "Equipe" },
];

// Cabeçalho escuro + navegação inferior, pensada para uso com uma mão no celular
export default function Moldura({ titulo, ativo, voltar, children }) {
  return (
    <div className="min-h-dvh pb-24">
      <header className="sticky top-0 z-10 bg-goa-noite text-white pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-xl items-center gap-3 px-4 py-3">
          {voltar ? (
            <Link href={voltar} className="-ml-1 px-1 text-2xl leading-none text-white/80" aria-label="Voltar">
              ‹
            </Link>
          ) : (
            <Brasao className="h-8 w-8" />
          )}
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.14em] text-goa-dourado">GOA · CBMRO</p>
            <h1 className="truncate font-display text-2xl font-semibold leading-tight">{titulo}</h1>
          </div>
        </div>
      </header>
      <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-4">{children}</main>
      <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-goa-linha bg-white pb-[env(safe-area-inset-bottom)]">
        <div className="mx-auto grid max-w-xl grid-cols-3">
          {ABAS.map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`py-3 text-center text-sm font-medium ${
                ativo === a.href ? "text-goa-vermelho" : "text-goa-hangar"
              }`}
            >
              {a.rotulo}
            </Link>
          ))}
        </div>
      </nav>
    </div>
  );
}
