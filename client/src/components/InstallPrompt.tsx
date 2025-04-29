import { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

export default function InstallPrompt() {
  const { theme } = useTheme();
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Event fired when PWA is installable
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Store the event for later use
      setDeferredPrompt(e);
      // Show the install button
      setShowPrompt(true);
    };

    // Event listener for install prompt
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    const isAppInstalled = window.matchMedia('(display-mode: standalone)').matches;
    if (isAppInstalled) {
      setShowPrompt(false);
    }

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult: { outcome: string }) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      // Reset the deferredPrompt variable
      setDeferredPrompt(null);
      setShowPrompt(false);
    });
  };

  if (!showPrompt) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '70px', // Above the network status if showing
        right: '20px',
        background: theme === 'dark' ? '#333' : '#fff',
        color: theme === 'dark' ? '#fff' : '#333',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: theme === 'dark' 
          ? '0 2px 10px rgba(0,0,0,0.5)' 
          : '0 2px 10px rgba(0,0,0,0.2)',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '300px',
        border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
      }}
    >
      <div style={{ fontWeight: 'bold' }}>Install LingoMitra</div>
      <p style={{ margin: '0', fontSize: '14px' }}>
        Add LingoMitra to your home screen for quick access to your language lessons, even offline!
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setShowPrompt(false)}
          style={{
            background: 'transparent',
            border: theme === 'dark' ? '1px solid #555' : '1px solid #ccc',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            color: theme === 'dark' ? '#fff' : '#333',
          }}
        >
          Not Now
        </button>
        <button 
          onClick={handleInstallClick}
          style={{
            background: '#ff6600',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          Install
        </button>
      </div>
    </div>
  );
}