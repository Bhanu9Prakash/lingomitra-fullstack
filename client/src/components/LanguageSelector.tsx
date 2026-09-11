import type { Language } from "@shared/schema";
import LanguageDropdown from "./LanguageDropdown";

// Preserve the older import and prop contract while sharing the accessible picker.
export default function LanguageSelector({selectedLanguage,languages}:{selectedLanguage:Language|null|undefined;languages:Language[]}){
 return <LanguageDropdown selectedLanguage={selectedLanguage??null} languages={languages}/>;
}
