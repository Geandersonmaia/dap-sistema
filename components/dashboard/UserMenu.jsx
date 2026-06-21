"use client";

import { useState, useRef, useEffect } from "react";
import { getSession, signOut } from "next-auth/react";

export default function UserMenu() {
  const [session, setSession] = useState(null);
  const [aberto, setAberto] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  useEffect(() => {
    function fechar(e) {
      if (ref.current && !ref.current.contains(e.target)) setAberto(false);
    }
    document.addEventListener("click", fechar);
    return () => document.removeEventListener("click", fechar);
  }, []);

  if (!session?.user) return null;

  const { name, email, image } = session.user;

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setAberto((v) => !v)} className="flex items-center gap-2">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name || "Usuário"} className="h-8 w-8 rounded-full" />
        ) : (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1e3a6e] text-xs font-semibold text-white">
            {(name || email || "?").slice(0, 1).toUpperCase()}
          </div>
        )}
        <span className="hidden text-sm font-medium text-gray-700 sm:inline">{name}</span>
      </button>

      {aberto && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
          <p className="truncate text-sm font-medium text-gray-900">{name}</p>
          <p className="truncate text-xs text-gray-400">{email}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mt-3 w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
          >
            Sair
          </button>
        </div>
      )}
    </div>
  );
}
