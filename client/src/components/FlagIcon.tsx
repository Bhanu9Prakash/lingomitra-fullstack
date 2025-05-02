import React from 'react';

interface FlagIconProps {
  code: string;
  size?: number;
  className?: string;
}

/**
 * Renders a flag icon based on country code
 * Uses country flag emoji or SVG
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
    'zh': 'cn', // Chinese -> China
    'ja': 'jp', // Japanese -> Japan
    'ko': 'kr', // Korean -> South Korea
    'ar': 'sa', // Arabic -> Saudi Arabia
    'hi': 'in', // Hindi -> India
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
    'kn': 'in', // Kannada -> India
  };

  // Use provided code (which may be a country code) or map from language code
  const countryCode = code.length === 2 ? (languageToCountryMap[code.toLowerCase()] || code.toLowerCase()) : code.toLowerCase();
  
  // Simple style for flag emoji display
  const style = {
    width: `${size}px`,
    height: `${size}px`,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: `${size * 0.75}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#f1f5f9'
  };

  // Show emoji flag instead of SVG for simpler implementation
  return (
    <div style={style} className={className} title={`Flag: ${countryCode.toUpperCase()}`}>
      {getFlagEmoji(countryCode)}
    </div>
  );
}

// Convert country code to flag emoji
function getFlagEmoji(countryCode: string) {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}