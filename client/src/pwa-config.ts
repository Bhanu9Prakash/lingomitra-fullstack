// Register the service worker
export function registerServiceWorker() {
  // Check if we're in the verification process or on verification page
  // If so, skip service worker registration to avoid interrupting verification
  const isVerificationPage = window.location.pathname.startsWith('/verify-email');
  const inVerificationProcess = sessionStorage.getItem('inVerificationProcess') === 'true';
  
  if (isVerificationPage || inVerificationProcess) {
    console.log('Skipping service worker registration during verification process');
    return;
  }
  
  // Skip registration if not supported
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      // Add cache-busting query parameter to ensure we get the latest service worker
      navigator.serviceWorker.register(`/service-worker.js?v=${Date.now()}`)
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
          
          // Handle updates - track if we've already shown the notification
          let updateNotificationShown = false;
          
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker && !updateNotificationShown) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller && !updateNotificationShown) {
                  // Set flag to prevent multiple notifications
                  updateNotificationShown = true;
                  
                  // Store in sessionStorage to prevent showing again if user reloads without accepting
                  const lastUpdateTime = sessionStorage.getItem('lastUpdatePrompt');
                  const now = Date.now();
                  
                  // Only show if we haven't shown in the last 5 minutes
                  // Skip during verification process (both by URL check and sessionStorage flag)
                  const inVerification = window.location.pathname.startsWith('/verify-email') || 
                                      sessionStorage.getItem('inVerificationProcess') === 'true';
                  
                  if ((!lastUpdateTime || (now - parseInt(lastUpdateTime)) > 5 * 60 * 1000) && 
                      !inVerification) {
                    sessionStorage.setItem('lastUpdatePrompt', now.toString());
                    
                    // New content is available; notify the user
                    if (confirm('New content available. Reload once to see the latest version?')) {
                      window.location.reload();
                    }
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