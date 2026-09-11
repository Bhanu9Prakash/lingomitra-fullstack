import { pathways } from '@shared/pathways';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

export default function LearningLanguagePicker({ code, onChange }: { code: string; onChange: (code: string) => void }) {
  return <div className="studio-language-picker"><Label htmlFor="workspace-language">Learning language</Label><Select value={code} onValueChange={onChange}><SelectTrigger id="workspace-language"><SelectValue placeholder="Choose a language" /></SelectTrigger><SelectContent position="popper">{pathways.map(p => <SelectItem key={p.code} value={p.code}>{p.name} · {p.nativeName}</SelectItem>)}</SelectContent></Select></div>;
}
