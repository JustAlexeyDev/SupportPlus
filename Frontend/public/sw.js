const CACHE_NAME = 'supportplus-v2';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  // Немедленно активируем новый service worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Немедленно берем контроль над всеми клиентами
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', (event) => {
  // Не кешируем API запросы - они должны идти напрямую на сервер
  const url = event.request.url;
  
  // Проверяем, является ли запрос API запросом
  const isApiRequest = url.includes('/auth/') || 
                       url.includes('/api/') ||
                       url.includes('/users') ||
                       url.includes('/beneficiary-categories') ||
                       url.includes(':8000') ||
                       url.includes('0.0.0.0');
  
  if (isApiRequest) {
    // Для API запросов не используем кеш - пропускаем service worker
    // Просто не вызываем event.respondWith(), чтобы запрос прошел напрямую
    return;
  }
  
  // Для остальных запросов используем кеш
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
      .catch(() => {
        // В случае ошибки просто делаем обычный fetch
        return fetch(event.request);
      })
  );
});