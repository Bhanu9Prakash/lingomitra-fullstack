// Service Worker for LingoMitra PWA
const CACHE_NAME = 'lingomitra-cache-v2';  // Increment cache version to force refresh

// Assets to cache on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.webmanifest',
  '/manifest-dark.webmanifest',
  '/favicon.ico',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/social/og-image.svg'
];

// Install event - precache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Pre-caching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => {
      console.log('[Service Worker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - network with cache fallback strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }
  
  // Special handling for lesson API requests - cache last 3 lessons accessed
  if (event.request.url.includes('/api/lessons/')) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        // Use stale-while-revalidate strategy for lesson data
        return cache.match(event.request).then((cachedResponse) => {
          // Create a promise for the network request
          const fetchPromise = fetch(event.request)
            .then((networkResponse) => {
              // Only cache GET responses
              if (event.request.method === 'GET' && networkResponse.ok) {
                // Clone the response before using it
                const responseCopy = networkResponse.clone();
                
                // Clean up older lesson data if we have too many cached
                // This ensures we only keep approximately the last 3 lessons
                cache.keys().then(keys => {
                  const lessonKeys = keys.filter(key => 
                    key.url.includes('/api/lessons/') && 
                    key.url !== event.request.url
                  );
                  
                  // If we have more than 2 other lessons cached (plus this one = 3 total)
                  if (lessonKeys.length > 2) {
                    // Sort by last accessed (assuming most recent access is what we want to keep)
                    // We would need a more sophisticated approach with timestamps for perfect LRU
                    const oldestKey = lessonKeys[0];
                    cache.delete(oldestKey);
                  }
                });
                
                // Cache the fresh response
                cache.put(event.request, responseCopy);
              }
              return networkResponse;
            });
          
          // Return cached response if we have it, otherwise wait for the network
          return cachedResponse || fetchPromise.catch(error => {
            console.error('Fetch failed:', error);
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
        });
      })
    );
    return;
  }
  
  // Regular API requests handling
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Only cache GET responses
          if (event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache (only works for GET)
          if (event.request.method === 'GET') {
            return caches.match(event.request);
          }
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        })
    );
    return;
  }
  
  // For non-API requests, network-first for HTML files and CSS/JS bundles, cache-first for other assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // For HTML files and CSS/JS bundles, always try network first to get fresh content
      if ((event.request.mode === 'navigate' || 
          event.request.url.includes('.js') || 
          event.request.url.includes('.css')) && 
          event.request.method === 'GET') {
        return fetch(event.request)
          .then(response => {
            // Cache the fresh response (only for GET)
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return response;
          })
          .catch(() => {
            // If network fails, use cache as fallback
            if (cachedResponse) {
              return cachedResponse;
            }
            // If no cache for navigation, show offline page
            if (event.request.mode === 'navigate') {
              return caches.match('/offline.html');
            }
            return new Response('Network error happened', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      }
      
      // For other assets, try cache first
      if (cachedResponse) {
        // But still update the cache in the background (stale-while-revalidate)
        // Only for GET requests
        if (event.request.method === 'GET') {
          fetch(event.request).then(response => {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }).catch(() => {});
        }
        
        return cachedResponse;
      }
      
      // Not in cache, get from network
      return fetch(event.request)
        .then((response) => {
          // Cache the network response (only for GET requests)
          if (response.status === 200 && event.request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return response;
        })
        .catch((error) => {
          console.error('[Service Worker] Fetch failed:', error);
          // Return the offline page for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          // For other requests, just fail gracefully
          return new Response('Network error happened', {
            status: 408,
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});