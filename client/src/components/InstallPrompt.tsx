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
        background: theme === 'dark' ? 'var(--bg-light)' : 'var(--bg-color)',
        color: theme === 'dark' ? 'var(--text-color)' : 'var(--text-color)',
        padding: '15px',
        borderRadius: '8px',
        boxShadow: theme === 'dark' 
          ? 'var(--shadow)' 
          : 'var(--shadow)',
        zIndex: 9998,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        maxWidth: '300px',
        border: theme === 'dark' ? '1px solid var(--border-color)' : '1px solid var(--border-color)',
      }}
    >
      <div style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>Install LingoMitra</div>
      <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-light)' }}>
        Add LingoMitra to your home screen for quick access to your language lessons, even offline!
      </p>
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
        <button 
          onClick={() => setShowPrompt(false)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: '4px',
            padding: '8px 12px',
            cursor: 'pointer',
            color: 'var(--text-color)',
          }}
        >
          Not Now
        </button>
        <button 
          onClick={handleInstallClick}
          style={{
            background: 'var(--primary-color)',
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