import React, { useEffect, useRef } from 'react';

interface FlagIconProps {
  code: string;
  size?: number;
  className?: string;
}

/**
 * Renders a flag icon based on country code
 * Uses SVG flags from the public directory
 */
export default function FlagIcon({ code, size = 24, className = '' }: FlagIconProps) {
  // Map language codes to country codes for flags
  const languageToCountryMap: Record<string, string> = {
    'en': 'us', // English -> USA
    'es': 'es', // Spanish -> Spain
    'fr': 'fr', // French -> France
    'de': 'de', // German -> Germany
    'it': 'it', // Italian -> Italy
    'pt': 'pt', // Portuguese -> Portugal
    'ru': 'ru', // Russian -> Russia
    'zh': 'zh', // Chinese
    'ja': 'jp', // Japanese -> Japan
    'ko': 'kr', // Korean -> South Korea
    'ar': 'sa', // Arabic -> Saudi Arabia
    'hi': 'hi', // Hindi
    'tr': 'tr', // Turkish -> Turkey
    'nl': 'nl', // Dutch -> Netherlands
    'pl': 'pl', // Polish -> Poland
    'sv': 'se', // Swedish -> Sweden
    'fi': 'fi', // Finnish -> Finland
    'da': 'dk', // Danish -> Denmark
    'no': 'no', // Norwegian -> Norway
    'he': 'il', // Hebrew -> Israel
    'id': 'id', // Indonesian -> Indonesia
    'th': 'th', // Thai -> Thailand
    'vi': 'vn', // Vietnamese -> Vietnam
    'cs': 'cz', // Czech -> Czech Republic
    'hu': 'hu', // Hungarian -> Hungary
    'el': 'gr', // Greek -> Greece
    'bn': 'bd', // Bengali -> Bangladesh
    'kn': 'kn', // Kannada
  };

  // Use provided code (which may be a country code) or map from language code
  const flagCode = code.length === 2 ? (languageToCountryMap[code.toLowerCase()] || code.toLowerCase()) : code.toLowerCase();
  
  // Style for flag container
  const containerStyle = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  };

  // Return SVG flag image with lazy loading
  const [flagSrc, setFlagSrc] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  
  React.useEffect(() => {
    let isMounted = true;
    
    // Dynamically import the flag SVG
    import(/* @vite-ignore */ `/flags/${flagCode}.svg`)
      .then(module => {
        if (isMounted) {
          setFlagSrc(module.default || `/flags/${flagCode}.svg`);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          // If import fails, fall back to direct path
          setFlagSrc(`/flags/${flagCode}.svg`);
          setIsLoading(false);
        }
      });
    
    return () => { isMounted = false; };
  }, [flagCode]);
  
  return (
    <div 
      style={containerStyle} 
      className={`${className} flag-icon`} 
      title={`Flag: ${flagCode.toUpperCase()}`}
    >
      {isLoading ? (
        // Show a small loading placeholder while flag loads
        <div className="animate-pulse bg-gray-200 dark:bg-gray-700 w-full h-full rounded-sm"></div>
      ) : (
        <img 
          src={flagSrc || ''}
          alt={`${flagCode} flag`} 
          style={{ width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center' }}
          loading="lazy"
          onError={(e) => {
            // Fallback to emoji if SVG doesn't exist
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = getFlagEmoji(flagCode);
              parent.style.backgroundColor = document.documentElement.classList.contains('light') ? '#f1f5f9' : '#374151';
              parent.style.fontSize = `${size * 0.75}px`;
            }
          }}
        />
      )}
    </div>
  );
}

// Convert country code to flag emoji (used as fallback)
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}