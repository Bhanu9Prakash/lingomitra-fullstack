import { Redirect } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import MascotMoment from '@/components/MascotMoment';
export default function AuthPage(){
 const {user,isLoading,error}=useAuth();
 const candidate=new URLSearchParams(window.location.search).get('returnTo')||'/languages';
 const returnTo=candidate.startsWith('/')&&!candidate.startsWith('//')&&!candidate.includes('\\')&&!/^\/(auth|signin-with-chatgpt|signout-with-chatgpt|callback)([/?#]|$)/.test(candidate)?candidate:'/languages';
 if(user)return <Redirect to={returnTo}/>;
 return <main className="container mx-auto max-w-xl px-5 py-12 sm:py-20">
  <div className="rounded-3xl border border-border bg-card p-7 sm:p-10 text-center shadow-sm">
   <MascotMoment state="neutral" className="mx-auto mb-6 h-36 w-36 object-contain" alt="The LingoMitra fox welcomes you"/>
   <h1 className="text-3xl font-bold mb-3">Welcome to LingoMitra</h1>
   <p className="text-base text-muted-foreground mb-7">Sign in to save your lessons, reviews and conversations. Continue on any device with your ChatGPT account.</p>
   {error&&<p role="alert" className="mb-4 text-destructive">Your account could not be loaded. Please try again.</p>}
   <Button size="lg" asChild disabled={isLoading}><a href={'/signin-with-chatgpt?return_to='+encodeURIComponent(returnTo)} target="_top">{isLoading?'Checking sign-in…':'Continue with ChatGPT'}</a></Button>
   <p className="mt-6 text-sm text-muted-foreground">All 209 lessons are available. No LingoMitra payment required.</p>
  </div>
 </main>;
}
