// Register the service worker
export function registerServiceWorker() {
  // Skip registration if not supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Add cache-busting query parameter to ensure we get the latest service worker
      navigator.serviceWorker.register(`/service-worker.js?v=${Date.now()}`)
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New content is available; notify the user
                  if (confirm('New content available. Reload?')) {
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch(error => {
          console.error('ServiceWorker registration failed: ', error);
        });
    });
  } else {
    console.log('ServiceWorker not supported in this browser');
  }
}