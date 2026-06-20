"use client";

import { useEffect, useRef } from "react";
import { signOut } from "next-auth/react";

const EVENTOS = ["mousemove", "keydown", "click", "scroll", "touchstart"];

export function useInactivityLogout(minutos = 30) {
  const timerRef = useRef(null);

  useEffect(() => {
    function resetar() {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        signOut({ callbackUrl: "/login" });
      }, minutos * 60 * 1000);
    }

    EVENTOS.forEach((ev) => window.addEventListener(ev, resetar));
    resetar();

    return () => {
      EVENTOS.forEach((ev) => window.removeEventListener(ev, resetar));
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [minutos]);
}
