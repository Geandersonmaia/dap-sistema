"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import ChatWidget from "./ChatWidget";
import { useInactivityLogout } from "@/hooks/useInactivityLogout";

export default function DashboardLayout({ titulo, children }) {
  const [menuAberto, setMenuAberto] = useState(false);
  useInactivityLogout(30); // sai automaticamente após 30 min sem uso

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar aberta={menuAberto} onClose={() => setMenuAberto(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header titulo={titulo} onAbrirMenu={() => setMenuAberto(true)} />
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
      <ChatWidget />
    </div>
  );
}
