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
const FlagIcon: React.FC<FlagIconProps> = ({ code, size = 20, className = '' }) => {
  // Map language codes to country codes for flags
  const getCountryCode = (langCode: string): string => {
    const mapping: Record<string, string> = {
      'en': 'GB', // English -> Great Britain
      'es': 'ES', // Spanish -> Spain
      'fr': 'FR', // French -> France
      'de': 'DE', // German -> Germany
      'it': 'IT', // Italian -> Italy
      'pt': 'PT', // Portuguese -> Portugal
      'ru': 'RU', // Russian -> Russia
      'zh': 'CN', // Chinese -> China
      'ja': 'JP', // Japanese -> Japan
      'ko': 'KR', // Korean -> South Korea
      'ar': 'SA', // Arabic -> Saudi Arabia
      'hi': 'IN', // Hindi -> India
      'bn': 'BD', // Bengali -> Bangladesh
      'pa': 'IN', // Punjabi -> India
      'ta': 'IN', // Tamil -> India
      'te': 'IN', // Telugu -> India
      'mr': 'IN', // Marathi -> India
      'gu': 'IN', // Gujarati -> India
      'kn': 'IN', // Kannada -> India
      'ml': 'IN', // Malayalam -> India
      'or': 'IN', // Odia -> India
      'vi': 'VN', // Vietnamese -> Vietnam
      'th': 'TH', // Thai -> Thailand
      'id': 'ID', // Indonesian -> Indonesia
      'ms': 'MY', // Malay -> Malaysia
      'nl': 'NL', // Dutch -> Netherlands
      'pl': 'PL', // Polish -> Poland
      'tr': 'TR', // Turkish -> Turkey
      'uk': 'UA', // Ukrainian -> Ukraine
      'cs': 'CZ', // Czech -> Czech Republic
      'hu': 'HU', // Hungarian -> Hungary
      'sv': 'SE', // Swedish -> Sweden
      'el': 'GR', // Greek -> Greece
      'ro': 'RO', // Romanian -> Romania
      'he': 'IL', // Hebrew -> Israel
      'da': 'DK', // Danish -> Denmark
      'fi': 'FI', // Finnish -> Finland
      'no': 'NO', // Norwegian -> Norway
      'sk': 'SK', // Slovak -> Slovakia
      'bg': 'BG', // Bulgarian -> Bulgaria
      'hr': 'HR', // Croatian -> Croatia
      'lt': 'LT', // Lithuanian -> Lithuania
      'lv': 'LV', // Latvian -> Latvia
      'et': 'EE', // Estonian -> Estonia
      'sr': 'RS', // Serbian -> Serbia
    };

    return mapping[langCode.toLowerCase()] || langCode.toUpperCase();
  };

  // Use passed code or map language code to country code
  const flagCode = code.length === 2 ? getCountryCode(code) : code;

  // Render the flag
  return (
    <span 
      className={`flag-icon ${className}`} 
      style={{ 
        fontSize: `${size}px`,
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      {flagCode.length === 2 
        ? <img 
            src={`https://flagcdn.com/w20/${flagCode.toLowerCase()}.png`} 
            width={size} 
            height={size}
            alt={`${flagCode} flag`}
            style={{ borderRadius: '2px' }}
          />
        : flagCode // Fallback to emoji or text
      }
    </span>
  );
};

export default FlagIcon;