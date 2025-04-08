// Importando o Workbox
importScripts(
  "https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js"
);

const CACHE = "pwa-cafeteria";
const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/loja.html",
  "/sobre.html",
  "/produtos.html",
  "/style.css",
  "/js/script.js",
  "/assets/img/48 icon.png",
  "/assets/img/72 icon.png",
  "/assets/img/87 icon.png",
  "/assets/img/192 icon.png",
  "/assets/img/512 icon.png",
  "/assets/img/bg.jpg",
  "/assets/img/Cafereia.jpg",
  "/assets/img/Home.jpg",
  "/assets/img/Produtos 01.jpg",
  "/assets/img/Produtos 02.jpg",
  "/assets/img/Produtos 03.png. jpg",
  "/img/coffee-round-service-icon-by-Vexels.png",
  "/img/images.png",
  "/manifest.json",
];

// Instalando e armazenando os arquivos no cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting(); // Força a ativação imediata do service worker
});

// Ativando e limpando caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE) {
            return caches.delete(key); // Deleta caches antigos
          }
        })
      );
    })
  );
  self.clients.claim(); // Faz o novo SW assumir imediatamente
});

// Habilitando o pré-carregamento de navegação no Workbox
if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

// Interceptando as requisições para servir do cache quando offline
self.addEventListener("fetch", (event) => {
  // Tentando buscar o recurso da rede
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Se a resposta for válida, a armazena no cache
        const clonedResponse = response.clone();
        caches
          .open(CACHE)
          .then((cache) => cache.put(event.request, clonedResponse));
        return response;
      })
      .catch(() => {
        // Caso a rede falhe, tenta servir o recurso do cache
        return caches.match(event.request).then((cachedResponse) => {
          // Se o recurso não estiver no cache, retorna a página inicial (index.html)
          return cachedResponse || caches.match("/index.html");
        });
      })
  );
});
