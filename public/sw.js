const CACHE_NAME = "dap-sistema-v1";
const ARQUIVOS_ESTATICOS = ["/icon-192.png", "/icon-512.png", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ARQUIVOS_ESTATICOS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((nomes) =>
      Promise.all(nomes.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    )
  );
});

// Network-first: nunca serve dados antigos do Notion/API a partir do cache.
// Só usa cache como fallback se a rede estiver indisponível, e só para
// arquivos estáticos (ícones, manifest) — nunca para chamadas de API.
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (url.pathname.startsWith("/api/")) return; // nunca interceptar chamadas de API

  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
