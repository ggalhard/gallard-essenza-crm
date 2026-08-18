// Service worker do Caderno Gallard — só cuida do "casco" do app (HTML/ícones),
// nunca de dado de negócio (esse fica só no localStorage do navegador, nunca
// passa por aqui). Cache-first com atualização em segundo plano: abre rápido
// e funciona offline, mas sempre tenta buscar versão nova pra próxima vez.
// Subir esse número a cada mudança no app, senão o celular que já tem o
// Caderno instalado continua servindo a versão antiga do cache. O activate
// abaixo apaga todo cache com nome diferente deste.
const CACHE = "caderno-gallard-v3";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then((cached) => {
      const network = fetch(e.request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
          }
          return res;
        })
        .catch(() => cached);
      return cached || network;
    })
  );
});
