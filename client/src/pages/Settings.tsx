import { pathway } from '@shared/pathways';
import { Switch } from "@/components/ui/switch";
import LearningPreferences from '@/components/LearningPreferences';
import type {CourseOverview} from '@shared/learning';
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useSimpleToast } from '@/hooks/use-simple-toast';
import { Loader2, AlertCircle, RefreshCw, Trash2, LockKeyhole, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { useLocation } from 'wouter';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface User {
  id: number;
  username: string;
  email: string;
}

type Language = {
  id: number;
  code: string;
  name: string;
  flagCode: string;
  nativeName: string;
  isAvailable: boolean;
};

type Progress = {
  id: number;
  userId: number;
  lessonId: string;
  completed: boolean;
  completedAt: string | null;
  progress: number;
  score: number | null;
  lastAccessedAt: string;
  timeSpent: number;
  notes: string | null;
};

function EnrolledLanguageCard({language,stats,onResetProgress,resetMutation}:{language:Language;stats:CourseOverview['courses'][number];onResetProgress:(code:string)=>void;resetMutation:any}){
 return <div className="rounded-lg border border-border p-5"><h3 className="text-lg font-semibold">{language.name}</h3><p>{stats.completed} of {stats.total} course activities completed. This is completion, not mastery.</p><AlertDialog><AlertDialogTrigger asChild><Button variant="ghost" disabled={resetMutation.isPending}>Reset this language</Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Reset {language.name} learning?</AlertDialogTitle><AlertDialogDescription>This removes your course progress, lesson drafts, starter attempts and lesson chats for this language. It cannot be undone. Other languages and unlocked access are unchanged.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={()=>onResetProgress(language.code)}>Reset this language</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div>;
}

export default function Settings() {
  const toast = useSimpleToast();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();
  const { logoutMutation, user, isLoading: isLoadingUser } = useAuth();
  const [confirmDeleteText, setConfirmDeleteText] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  // Fetch all languages
  const { data: languages, isLoading: isLoadingLanguages } = useQuery<Language[]>({
    queryKey: ['/api/languages'],
  });
  
  const overview=useQuery<CourseOverview>({queryKey:['/api/progress/overview'],enabled:Boolean(user)});
  const enrolledLanguages=(languages||[]).filter(l=>overview.data?.courses.find(c=>c.languageCode===l.code)?.hasStarted);

  const preferencesMutation = useMutation({
    mutationFn: async (ttsEnabled: boolean) => {
      const response = await fetch('/api/user/preferences', {method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify({ttsEnabled})});
      if (!response.ok) throw new Error('Your preference could not be saved.');
    },
    // Re-read the active session; an older account's delayed save must never replace it.
    onSuccess: () => queryClient.invalidateQueries({queryKey: ['/api/user'], exact: true}),
    onError: (error: Error) => toast.error('Could not save', error.message),
  });

  // Delete account mutation
  const deleteAccountMutation = useMutation({
    mutationFn: async (confirmation: string) => {
      setIsDeleting(true);
      
      try {
        const response = await fetch('/api/user/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ confirmation }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete account');
        }
        
        return await response.json();
      } finally {
        setIsDeleting(false);
      }
    },
    onSuccess: async () => {
      toast.toast({
        title: 'Account Deleted',
        description: 'Your LingoMitra data has been deleted. Your ChatGPT account is unchanged.',
        variant: 'default',
      });
      
      // Log the user out
      await logoutMutation.mutateAsync();
    },
    onError: (error: Error) => {
      toast.toast({
        title: 'Error',
        description: error.message || 'Failed to delete your account. Please try again.',
        variant: 'destructive',
      });
    },
  });
  
  // Handle account deletion
  const handleDeleteAccount = () => {
    if (!user) return;
    
    if (confirmDeleteText !== user.username) {
      toast.toast({
        title: 'Confirmation Failed',
        description: 'The confirmation text does not match your username.',
        variant: 'destructive',
      });
      return;
    }
    
    deleteAccountMutation.mutate(confirmDeleteText);
  };
  
  // Reset progress mutation
  const resetProgressMutation = useMutation({
    mutationFn: async (languageCode: string) => {
      const response = await fetch(`/api/progress/language/${languageCode}/reset`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to reset progress');
      }
      
      return response.json();
    },
    onSuccess: (data, languageCode) => {
      try{const ids=pathway(languageCode)?.starters||[];for(const key of Object.keys(sessionStorage)){if(key.startsWith(`lingomitra-practice:${user?.id}:${languageCode}-`)||key.startsWith(`lingomitra-draft:${user?.id}:`)&&ids.some(id=>key.includes(':'+id)))sessionStorage.removeItem(key);}}catch{}
      // Invalidate queries to refetch data
      queryClient.invalidateQueries();
      
      toast.toast({
        title: 'Progress Reset',
        description: `Your progress for ${languageCode.toUpperCase()} has been reset successfully.`,
        variant: 'default'
      });
    },
    onError: (error) => {
      toast.toast({
        title: 'Error',
        description: 'Failed to reset progress. Please try again.',
        variant: 'destructive'
      });
    },
  });
  
  // Handler for resetting progress
  const handleResetProgress = (languageCode: string) => {
    resetProgressMutation.mutate(languageCode);
  };
  
  if (isLoadingUser || isLoadingLanguages || overview.isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-200px)]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>
            You need to be logged in to access your settings.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  return (
    <div className="container max-w-4xl py-10 page-container">
      <h1 className="text-3xl font-bold mb-8">Account Settings</h1>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-2">Profile Information</h2>
        <p className="text-muted-foreground mb-6">Details from your ChatGPT account</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 break-words">
          <div>
            <p className="text-sm font-medium">Display name</p>
            <p className="text-muted-foreground">{user.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-border py-8 mb-4">
        <h2 className="text-2xl font-bold mb-2">Connected with ChatGPT</h2>
        <p className="text-muted-foreground">Your lessons, reviews and conversations sync when you sign in with the same ChatGPT account on another device.</p>
      </div>
      <div className="flex items-center justify-between gap-6 border-t border-border py-8">
        <div><h2 className="text-xl font-bold">Read-aloud controls</h2><p className="text-muted-foreground">Show audio playback for tutor replies. Saved to your ChatGPT-linked profile.</p></div>
        <Switch checked={user.ttsEnabled} onCheckedChange={value => preferencesMutation.mutate(value)} disabled={preferencesMutation.isPending} aria-label="Show read-aloud controls" />
      </div>
      <LearningPreferences />
      <div className="border-t border-zinc-800 pt-10">
        <h2 className="text-2xl font-bold mb-2">Language Courses</h2>
        <p className="text-muted-foreground mb-6">Your started courses and saved learning</p>
        
        {overview.error ? <div role="alert"><p>Your course history could not load. It has not been reset.</p><Button onClick={()=>overview.refetch()}>Try again</Button></div> : enrolledLanguages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">You haven't started any language courses yet.</p>
            <p className="text-sm mt-2">Choose any unlocked course to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {enrolledLanguages.map((language) => (
              <EnrolledLanguageCard 
                key={language.id} 
                language={language} 
                onResetProgress={handleResetProgress}
                resetMutation={resetProgressMutation}
                stats={overview.data!.courses.find(c=>c.languageCode===language.code)!}
              />
            ))}
          </div>
        )}
        
        <p className="text-sm text-muted-foreground text-center mt-8">
          Your progress is automatically saved as you complete lessons
        </p>
      </div>
      
      {/* Danger Zone */}
      <div className="border-t border-zinc-800 pt-10 mt-10">
        <h2 className="text-2xl font-bold mb-2 text-red-700 dark:text-red-300">Danger Zone</h2>
        <p className="text-muted-foreground mb-6">Irreversible account actions</p>
        
        <div className="rounded-lg p-6 bg-red-950/20 border border-red-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-300">Delete LingoMitra Data</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Permanently delete your LingoMitra progress, chats and settings. Your ChatGPT account will remain active.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="whitespace-nowrap"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete LingoMitra Data
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-700 dark:text-red-300">
                    Delete LingoMitra Data?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <p className="mb-4">
                      This will permanently delete your LingoMitra progress, conversations and settings. It will not delete your ChatGPT account.
                      This action <b>cannot be undone</b>.
                    </p>
                    <div className="bg-red-950/20 border border-red-900 rounded-md p-4 mb-4">
                      <p className="font-semibold mb-2">To confirm, type your display name: <b>{user.username}</b></p>
                      <Input
                        type="text"
                        placeholder="Enter your display name"
                        value={confirmDeleteText}
                        onChange={(e) => setConfirmDeleteText(e.target.value)}
                        className="bg-red-950/30 border-red-900/50"
                      />
                    </div>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={(e) => {
                      e.preventDefault(); // Prevent dialog from closing if validation fails
                      handleDeleteAccount();
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white"
                    disabled={confirmDeleteText !== user.username || isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting Account...
                      </>
                    ) : (
                      "Delete My LingoMitra Data"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}
