import { Toaster as LibraryToaster } from './sonner';

export function Toaster() {
  return <LibraryToaster position="top-right" closeButton visibleToasts={3} offset={{ top: '5rem', right: '1rem' }} mobileOffset={{ top: '5rem', right: '1rem', left: '1rem' }} />;
}
