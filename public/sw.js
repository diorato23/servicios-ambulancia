const CACHE_NAME = "ambulancia-crm-v1";

// Arquivos essenciais para cachear na instalação
const PRECACHE_URLS = [
  "/dashboard",
  "/dashboard/pacientes",
  "/dashboard/ordenes",
  "/dashboard/ambulancias",
  "/dashboard/tripulantes",
  "/dashboard/historias",
];

// Instalação: cachea os recursos essenciais
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch(() => {
        // Ignora erros de precache (algumas rotas podem não existir ainda)
        console.log("[SW] Precache parcial concluído");
      });
    })
  );
  self.skipWaiting();
});

// Ativação: limpa caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Estratégia: Network First com fallback para Cache
// - Tenta rede primeiro (dados frescos)
// - Se offline, serve do cache
self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Ignora requisições não-GET e APIs do Firebase
  if (
    request.method !== "GET" ||
    request.url.includes("firestore.googleapis.com") ||
    request.url.includes("firebase") ||
    request.url.includes("googleapis.com") ||
    request.url.includes("__nextjs") ||
    request.url.includes("_next/webpack")
  ) {
    return;
  }

  // Para assets estáticos (_next/static): Cache First
  if (request.url.includes("/_next/static/")) {
    event.respondWith(
      caches.match(request).then((cached) => {
        return cached || fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Para páginas HTML: Network First
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || caches.match("/dashboard");
          });
        })
    );
    return;
  }

  // Para outros recursos: Network First com Cache Fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});
