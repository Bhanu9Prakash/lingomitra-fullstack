import { registerSW } from 'virtual:pwa-register';

// Register the service worker
export function registerServiceWorker() {
  // Skip registration if not supported
  if ('serviceWorker' in navigator) {
    const updateSW = registerSW({
      onNeedRefresh() {
        // When an update is available
        console.log('New content available, click on reload button to update.');
        if (confirm('New content available. Reload?')) {
          updateSW(true);
        }
      },
      onOfflineReady() {
        // When the app is ready to work offline
        console.log('App ready to work offline');
      },
    });
    
    console.log('ServiceWorker registration successful');
  } else {
    console.log('ServiceWorker not supported in this browser');
  }
}