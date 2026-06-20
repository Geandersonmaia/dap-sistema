"use client";

import UserMenu from "./UserMenu";

export default function Header({ titulo, onAbrirMenu }) {
  return (
    <header className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 md:px-6">
      <div className="flex items-center gap-3">
        <button
          onClick={onAbrirMenu}
          className="rounded-md p-1.5 text-gray-500 hover:bg-gray-100 md:hidden"
          aria-label="Abrir menu"
        >
          ☰
        </button>
        <h1 className="text-lg font-semibold text-gray-900">{titulo}</h1>
      </div>
      <UserMenu />
    </header>
  );
}
