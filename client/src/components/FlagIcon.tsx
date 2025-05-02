import React from 'react';

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

  // Return SVG flag image
  return (
    <div 
      style={containerStyle} 
      className={`${className} flag-icon`} 
      title={`Flag: ${flagCode.toUpperCase()}`}
    >
      <img 
        src={`/flags/${flagCode}.svg`} 
        alt={`${flagCode} flag`} 
        style={{ width: '120%', height: '120%', objectFit: 'cover', objectPosition: 'center' }}
        onError={(e) => {
          // Fallback to emoji if SVG doesn't exist
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentElement;
          if (parent) {
            parent.innerHTML = getFlagEmoji(flagCode);
            parent.style.backgroundColor = '#f1f5f9';
            parent.style.fontSize = `${size * 0.75}px`;
          }
        }}
      />
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