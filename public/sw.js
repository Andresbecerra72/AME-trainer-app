/* eslint-disable no-restricted-globals */

// ============================================
// AME Exam Trainer - Advanced Service Worker
// Phase 2: Mobile Optimizations
// ============================================

const VERSION = 'v2.0.0';
const CACHE_NAME = `ame-exam-trainer-${VERSION}`;
const RUNTIME_CACHE = `ame-runtime-${VERSION}`;
const IMAGE_CACHE = `ame-images-${VERSION}`;
const DATA_CACHE = `ame-data-${VERSION}`;

// Cache configuration
const CACHE_CONFIG = {
  maxAge: {
    images: 7 * 24 * 60 * 60 * 1000, // 7 days
    data: 5 * 60 * 1000, // 5 minutes
    pages: 24 * 60 * 60 * 1000, // 24 hours
  },
  maxEntries: {
    images: 50,
    data: 30,
    pages: 20,
  },
};

// Assets to precache (critical resources)
const PRECACHE_URLS = [
  '/',
  '/protected/dashboard',
  '/protected/practice',
  '/protected/exams',
  '/offline',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// ============================================
// Installation Phase
// ============================================
self.addEventListener('install', (event) => {
  console.log(`[SW ${VERSION}] Installing...`);
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching critical assets');
        return cache.addAll(PRECACHE_URLS).catch((error) => {
          console.error('[SW] Precache failed for some assets:', error);
          return Promise.resolve();
        });
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================
// Activation Phase
// ============================================
self.addEventListener('activate', (event) => {
  console.log(`[SW ${VERSION}] Activating...`);
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((cacheName) => {
              return cacheName.startsWith('ame-') && 
                     cacheName !== CACHE_NAME &&
                     cacheName !== RUNTIME_CACHE &&
                     cacheName !== IMAGE_CACHE &&
                     cacheName !== DATA_CACHE;
            })
            .map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
        );
      }),
      
      // Claim clients immediately
      self.clients.claim(),
    ]).then(() => {
      console.log('[SW] Activation complete');
    })
  );
});

// ============================================
// Fetch Strategies
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip cross-origin requests (except images)
  if (!url.origin.includes(self.location.origin) && 
      !url.origin.includes('supabase') &&
      request.destination !== 'image') {
    return;
  }

  // Route to appropriate strategy
  if (url.pathname.includes('/api/') || url.pathname.includes('supabase')) {
    event.respondWith(networkFirstStrategy(request, DATA_CACHE));
  } else if (request.destination === 'image') {
    event.respondWith(cacheFirstStrategy(request, IMAGE_CACHE));
  } else if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(staleWhileRevalidateStrategy(request, RUNTIME_CACHE));
  } else if (request.mode === 'navigate') {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  } else {
    event.respondWith(networkFirstStrategy(request, RUNTIME_CACHE));
  }
});

// ============================================
// Caching Strategies
// ============================================

// Network First (with offline fallback)
async function networkFirstStrategy(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network request failed, trying cache:', request.url);
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlinePage = await caches.match('/offline');
      if (offlinePage) {
        return offlinePage;
      }
    }
    
    return new Response('Offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({ 'Content-Type': 'text/plain' }),
    });
  }
}

// Cache First (with network fallback)
async function cacheFirstStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      await cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Stale While Revalidate (best of both worlds)
async function staleWhileRevalidateStrategy(request, cacheName) {
  const cachedResponse = await caches.match(request);
  
  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        const cache = caches.open(cacheName);
        cache.then((c) => c.put(request, networkResponse.clone()));
      }
      return networkResponse;
    })
    .catch(() => cachedResponse);
  
  return cachedResponse || fetchPromise;
}

// ============================================
// Background Sync
// ============================================
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-exam-results') {
    event.waitUntil(syncExamResults());
  } else if (event.tag === 'sync-study-progress') {
    event.waitUntil(syncStudyProgress());
  }
});

async function syncExamResults() {
  console.log('[SW] Syncing exam results...');
  // Implementation would sync pending exam results
}

async function syncStudyProgress() {
  console.log('[SW] Syncing study progress...');
  // Implementation would sync study time, progress, etc.
}

// ============================================
// Push Notifications
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'AME Exam Trainer';
  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icon-192x192.png',
    badge: '/icon-96x96.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url || '/',
      timestamp: Date.now(),
    },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' },
    ],
    tag: data.tag || 'default',
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  const urlToOpen = event.notification.data.url;
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Focus existing window if available
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// ============================================
// Message Handler
// ============================================
self.addEventListener('message', (event) => {
  console.log('[SW] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames
              .filter((name) => name.startsWith('ame-'))
              .map((name) => caches.delete(name))
          );
        })
        .then(() => {
          console.log('[SW] All caches cleared');
          return self.registration.unregister();
        })
    );
  }
  
  if (event.data.type === 'GET_CACHE_SIZE') {
    event.waitUntil(
      getCacheSize().then((size) => {
        event.ports[0].postMessage({
          type: 'CACHE_SIZE',
          size: size,
        });
      })
    );
  }
});

async function getCacheSize() {
  const cacheNames = await caches.keys();
  let totalSize = 0;
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('ame-')) {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();
      totalSize += requests.length;
    }
  }
  
  return totalSize;
}

console.log(`[SW ${VERSION}] Service Worker loaded`);
