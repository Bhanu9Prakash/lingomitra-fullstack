// Register the service worker
export function registerServiceWorker() {
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
                  
                  // Check if we're in the email verification flow
                  const isVerifyingEmail = window.location.pathname.includes('/verify-email') || 
                                          sessionStorage.getItem('pendingVerificationToken') || 
                                          sessionStorage.getItem('emailJustVerified');
                  
                  // Check if we recently verified (within the last minute)
                  const lastVerifiedTime = sessionStorage.getItem('emailVerifiedTimestamp');
                  const recentlyVerified = lastVerifiedTime && 
                                          (now - parseInt(lastVerifiedTime)) < 60 * 1000;
                  
                  // Only show if:
                  // 1. We haven't shown in the last 5 minutes
                  // 2. We're not in the email verification flow
                  // 3. We haven't recently verified our email
                  if ((!lastUpdateTime || (now - parseInt(lastUpdateTime)) > 5 * 60 * 1000) && 
                      !isVerifyingEmail && 
                      !recentlyVerified) {
                    
                    sessionStorage.setItem('lastUpdatePrompt', now.toString());
                    
                    // New content is available; notify the user
                    if (confirm('New content available. Reload once to see the latest version?')) {
                      window.location.reload();
                    }
                  } else {
                    console.log('Skipping service worker update notification during sensitive operation');
                    // We'll skip showing the popup now
                    // But we'll set a flag to show it later when it's safe
                    sessionStorage.setItem('pendingServiceWorkerUpdate', 'true');
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