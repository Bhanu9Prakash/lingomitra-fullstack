/**
 * Updates the theme-color meta tag and manifest based on user's theme preference
 */
export function updateThemeColor(theme: 'light' | 'dark'): void {
  // Get the theme-color meta tag
  let metaThemeColor = document.querySelector('meta[name="theme-color"]');
  
  // If it doesn't exist, create it
  if (!metaThemeColor) {
    metaThemeColor = document.createElement('meta');
    metaThemeColor.setAttribute('name', 'theme-color');
    document.head.appendChild(metaThemeColor);
  }
  
  // Set the content based on the theme
  const color = theme === 'dark' ? '#1a1a1a' : '#ffffff';
  metaThemeColor.setAttribute('content', color);
  
  // Update the manifest link to use the appropriate theme
  const manifestLink = document.getElementById('manifest-link') as HTMLLinkElement;
  if (manifestLink) {
    manifestLink.href = theme === 'dark' 
      ? '/manifest-dark.webmanifest' 
      : '/manifest.webmanifest';
  }
  
  // Update Apple-specific meta tags for theme
  const appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (appleStatusBar) {
    appleStatusBar.setAttribute('content', 
      theme === 'dark' ? 'black' : 'black-translucent'
    );
  }
  
  // Log the theme change for debugging
  console.log(`Theme updated to ${theme} mode (${color})`);
}