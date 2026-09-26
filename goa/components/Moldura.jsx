import Link from "next/link";
import Brasao from "./Brasao";
import Icone from "./Icone";

// Estrutura de tela no estilo iOS: barra superior translúcida, título grande e barra de abas flutuante
export default function Moldura({ titulo, subtitulo, ativo, voltar, children }) {
  return (
    <div className="min-h-dvh pb-36">
      <header className="sticky top-0 z-20 border-b border-white/5 bg-goa-noite/60 pt-[env(safe-area-inset-top)] backdrop-blur-2xl">
        <div className="mx-auto flex h-12 max-w-xl items-center justify-between px-4">
          {voltar ? (
            <Link href={voltar} className="-ml-1 flex items-center gap-0.5 text-[17px] text-goa-azul">
              <Icone nome="voltar" className="h-6 w-6" traco={2.2} />
              Voltar
            </Link>
          ) : (
            <span className="flex items-center gap-2 text-[13px] font-semibold tracking-wide text-goa-suave">
              <Brasao className="h-7 w-7" />
              GOA · CBMRO
            </span>
          )}
        </div>
      </header>

      <main className="mx-auto flex max-w-xl flex-col gap-5 px-4 pt-2">
        <div>
          <h1 className="font-display text-[34px] font-bold leading-tight tracking-tight">{titulo}</h1>
          {subtitulo && <p className="text-[15px] text-goa-suave">{subtitulo}</p>}
        </div>
        {children}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-center px-4 pb-[calc(env(safe-area-inset-bottom)+14px)]">
        <div className="vidro flex items-center gap-1 rounded-full border-white/15 bg-goa-noite2/70 p-1.5">
          <Aba href="/" rotulo="Painel" icone="painel" ativo={ativo === "/"} />
          <Link
            href="/missoes/nova"
            aria-label="Nova missão"
            className="mx-1 grid h-14 w-14 place-items-center rounded-full text-white transition active:scale-95"
            style={{
              background: "linear-gradient(180deg,#F03A41,#C81D24)",
              boxShadow: "0 10px 24px -6px rgba(224,36,43,.75), inset 0 1px 0 rgba(255,255,255,.3)",
            }}
          >
            <Icone nome="mais" className="h-7 w-7" traco={2.4} />
          </Link>
          <Aba href="/equipe" rotulo="Equipe" icone="pessoas" ativo={ativo === "/equipe"} />
        </div>
      </nav>
    </div>
  );
}

function Aba({ href, rotulo, icone, ativo }) {
  return (
    <Link
      href={href}
      className={`flex w-20 flex-col items-center gap-0.5 rounded-full py-1.5 text-[11px] font-medium transition ${
        ativo ? "bg-white/10 text-white" : "text-goa-suave"
      }`}
    >
      <Icone nome={icone} className="h-6 w-6" />
      {rotulo}
    </Link>
  );
}
