import { createContext, ReactNode, useContext } from 'react';
import { useQuery, useMutation, UseMutationResult } from '@tanstack/react-query';
import type { User } from '@shared/schema';
import { queryClient } from '@/lib/queryClient';
type AuthContextType={user:User|null;isLoading:boolean;error:Error|null;logoutMutation:UseMutationResult<void,Error,void>};
const AuthContext=createContext<AuthContextType|null>(null);
export function AuthProvider({children}:{children:ReactNode}){
 const {data:user,error,isLoading}=useQuery<User|null,Error>({queryKey:['/api/user'],retry:false,staleTime:0,refetchOnWindowFocus:true,queryFn:async({signal})=>{
  const response=await fetch('/api/user',{credentials:'include',cache:'no-store',signal});
  if(response.status!==401&&!response.ok)throw new Error('Your account could not be loaded. Please try again.');
  const next=response.status===401?null:await response.json() as User;
  const previous=queryClient.getQueryData<User|null>(['/api/user']);
  if(previous?.chatgptId!==next?.chatgptId)queryClient.removeQueries({predicate:q=>q.queryKey[0]!=='/api/user'});
  return next;
 }});
 const logoutMutation=useMutation<void,Error,void>({mutationFn:async()=>{
  queryClient.clear();
  try{for(const key of Object.keys(sessionStorage))if(key.startsWith('lingomitra-draft:')||key.startsWith('lingomitra-practice:'))sessionStorage.removeItem(key);}catch{}
  window.top!.location.href='/signout-with-chatgpt?return_to=%2F';
 }});
 return <AuthContext.Provider value={{user:user||null,error,isLoading,logoutMutation}}><div key={user?.chatgptId||'anonymous'}>{children}</div></AuthContext.Provider>;
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used within AuthProvider');return value;}
