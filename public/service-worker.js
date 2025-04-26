// Service Worker для поддержки офлайн-режима

const CACHE_NAME = 'smartcart-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/demo.html',
  '/manifest.json',
  '/static/css/main.9145200e.css',
  '/static/js/main.14d0dc52.js'
];

// API данные для кэширования
const DATA_CACHE_NAME = 'smartcart-data-v1';

// Установка Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Caching files');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, DATA_CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Service Worker: Deleting old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Стратегия кэширования: Cache First, затем Network
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);
  
  // Обрабатываем API запросы отдельно
  if (requestUrl.pathname.startsWith('/api/')) {
    // Для API используем Network First, с запасным вариантом из кэша
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Успешный ответ с сервера - кэшируем его копию
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DATA_CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Нет подключения, пробуем получить из кэша
          return caches.match(event.request);
        })
    );
  } else {
    // Для статических ресурсов: сначала кэш, затем сеть
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request)
            .then((fetchResponse) => {
              // Кэшируем новые ресурсы при их получении
              return caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, fetchResponse.clone());
                  return fetchResponse;
                });
            });
        })
        .catch((error) => {
          console.log('Service Worker fetch error:', error);
          // Если запрос на HTML страницу и мы не можем ее получить, показываем офлайн-страницу
          if (event.request.headers.get('accept').includes('text/html')) {
            return caches.match('/demo.html');
          }
        })
    );
  }
});

// Синхронизация данных, когда пользователь вернулся онлайн
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-shopping-lists') {
    event.waitUntil(syncShoppingLists());
  }
});

// Функция синхронизации данных
async function syncShoppingLists() {
  // Получаем данные из IndexedDB, которые нужно синхронизировать
  const listsToSync = await getItemsToSync();
  
  // Если есть данные для синхронизации
  if (listsToSync && listsToSync.length > 0) {
    try {
      // Отправляем данные на сервер
      await Promise.all(listsToSync.map(async (list) => {
        const response = await fetch('/api/shopping-lists', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(list),
        });
        
        if (response.ok) {
          // Помечаем запись как синхронизированную
          await markAsSynced(list.id);
        }
      }));
      
      // Уведомление пользователя о успешной синхронизации
      self.registration.showNotification('SmartCart', {
        body: 'Ваши списки покупок синхронизированы',
        icon: '/icon.png'
      });
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}

// Заглушки для функций работы с IndexedDB
// В реальном приложении здесь должны быть функции работы с IndexedDB
async function getItemsToSync() {
  // TODO: Реализовать получение данных из IndexedDB
  return [];
}

async function markAsSynced(id) {
  // TODO: Реализовать обновление статуса синхронизации в IndexedDB
}

// Обработка уведомлений для нейросети
self.addEventListener('push', (event) => {
  const data = event.data.json();
  const title = data.title || 'SmartCart';
  const options = {
    body: data.body || 'Новые рекомендации доступны',
    icon: '/icon.png',
    badge: '/badge.png',
    data: {
      url: data.url || '/'
    }
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Обработка клика по уведомлению
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({type: 'window'})
      .then((clientList) => {
        const url = event.notification.data.url;
        
        // Если уже есть открытое окно, фокусируемся на нем
        for (const client of clientList) {
          if (client.url === url && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Иначе открываем новое окно
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});