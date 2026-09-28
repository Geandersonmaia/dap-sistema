"use client";

import { useCallback, useEffect, useState } from "react";

export async function chamarAPI(url, opcoes = {}) {
  const resp = await fetch(url, {
    ...opcoes,
    headers: { "Content-Type": "application/json", ...(opcoes.headers || {}) },
    body: opcoes.body && typeof opcoes.body !== "string" ? JSON.stringify(opcoes.body) : opcoes.body,
  });
  const json = await resp.json().catch(() => ({}));
  if (!resp.ok || json.error) throw new Error(json.error || `Erro ${resp.status}`);
  return json;
}

export function useDados(url) {
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    if (!url) return;
    setCarregando(true);
    try {
      setDados(await chamarAPI(url));
      setErro(null);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, [url]);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  return { dados, erro, carregando, recarregar };
}

export function useObra(id) {
  return useDados(id ? `/api/obras/${id}` : null);
}
