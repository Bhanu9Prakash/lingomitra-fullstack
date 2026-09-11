import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from './use-auth';
import { pathway } from '@shared/pathways';
import { learningApi } from '@/lib/learning-api';

/** Language changes alter the view, never the owner or saved learning record. */
export function useLearningScope() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const cache = useQueryClient();
  const [error, setError] = useState('');
  const routeCode = location.split('/')[2];
  const code = pathway(routeCode)?.code || pathway(user?.preferences?.selectedTarget || '')?.code || '';
  async function select(next: string) {
    if (!pathway(next)) return;
    navigate(`/${location.split('/')[1]}/${next}`);
    setError('');
    try {
      await learningApi('/api/user/preferences', { selectedTarget: next }, 'PATCH');
      await cache.invalidateQueries({ queryKey: ['/api/user'] });
    } catch { setError('This language is open here. Your account preference could not save; try selecting it again.'); }
  }
  return { code, selected: pathway(code), select, error, user };
}
