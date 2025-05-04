import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { useSimpleToast } from '@/hooks/use-simple-toast';
import { Loader2, AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
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

// Separate component for each language card to properly handle the state
function EnrolledLanguageCard({ 
  language, 
  onResetProgress, 
  resetMutation, 
  calculateProgress 
}: { 
  language: Language; 
  onResetProgress: (code: string) => void; 
  resetMutation: any;
  calculateProgress: (code: string) => Promise<{ completed: number; total: number; percent: number; }>;
}) {
  const [progressStats, setProgressStats] = useState({ completed: 0, total: 0, percent: 0 });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch progress stats
  useEffect(() => {
    setIsLoading(true);
    calculateProgress(language.code).then((stats) => {
      setProgressStats(stats);
      setIsLoading(false);
    });
  }, [language.code, resetMutation.isSuccess, calculateProgress]);
  
  return (
    <div className="rounded-lg p-5 bg-zinc-800/20">
      <div className="flex justify-between items-center mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-6 overflow-hidden rounded">
            <img
              src={`/flags/${language.flagCode}.svg`}
              alt={`${language.name} Flag`}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium text-base">{language.name}</h3>
          </div>
        </div>
        <Badge variant="outline" className="bg-zinc-800 text-white border-none font-medium uppercase text-xs px-2 py-1">{language.code}</Badge>
      </div>
      
      <div className="mt-6 mb-3">
        <p className="text-sm font-medium mb-2">Progress</p>
        {isLoading ? (
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Loading...
          </p>
        ) : (
          <p className="text-sm text-muted-foreground mb-3">
            {progressStats.completed} of {progressStats.total} lessons completed ({progressStats.percent}%)
          </p>
        )}
      
        <div className="w-full bg-secondary/20 rounded-full h-2 mb-5">
          <div 
            className="bg-orange-500 h-2 rounded-full transition-all duration-500" 
            style={{ width: `${progressStats.percent}%` }}
          ></div>
        </div>
      </div>
        
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-xs font-medium px-3 py-1 h-auto text-muted-foreground hover:text-orange-500"
              disabled={resetMutation.isPending}
            >
              {resetMutation.isPending && resetMutation.variables === language.code ? (
                <>
                  <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                  Resetting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-3 w-3" />
                  Reset Progress
                </>
              )}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will reset all your progress for {language.name}. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onResetProgress(language.code)}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Reset Progress
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}

export default function Settings() {
  const toast = useSimpleToast();
  const queryClient = useQueryClient();
  const [_, navigate] = useLocation();
  const { logoutMutation } = useAuth();
  const [enrolledLanguages, setEnrolledLanguages] = useState<Language[]>([]);
  const [confirmDeleteText, setConfirmDeleteText] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Fetch all languages
  const { data: languages, isLoading: isLoadingLanguages } = useQuery<Language[]>({
    queryKey: ['/api/languages'],
  });
  
  // Fetch user data to check if the user is logged in
  const { data: user, isLoading: isLoadingUser } = useQuery<User>({
    queryKey: ['/api/user'],
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
        description: 'Your account has been successfully deleted.',
        variant: 'default',
      });
      
      // Log the user out
      await logoutMutation.mutateAsync();
      
      // Redirect to languages page
      navigate('/languages');
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
      // Invalidate queries to refetch data
      queryClient.invalidateQueries({ queryKey: [`/api/progress/language/${languageCode}`] });
      
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
  
  // Determine which languages the user has progress in
  useEffect(() => {
    if (!languages || !user) return;

    // For each language, check if the user has progress
    const checkEnrollment = async () => {
      const enrolledLangs: Language[] = [];
      
      const availableLanguages = Array.isArray(languages) ? languages : [];
      
      for (const language of availableLanguages) {
        try {
          const response = await fetch(`/api/progress/language/${language.code}`);
          if (response.ok) {
            const progressData = await response.json();
            if (progressData && progressData.length > 0) {
              enrolledLangs.push(language);
            }
          }
        } catch (error) {
          console.error(`Error checking progress for ${language.code}:`, error);
        }
      }
      
      setEnrolledLanguages(enrolledLangs);
    };
    
    checkEnrollment();
  }, [languages, user]);
  
  // Handler for resetting progress
  const handleResetProgress = (languageCode: string) => {
    resetProgressMutation.mutate(languageCode);
  };
  
  // Calculate progress statistics for a language
  const calculateProgress = async (languageCode: string) => {
    try {
      const response = await fetch(`/api/progress/language/${languageCode}`);
      if (!response.ok) return { completed: 0, total: 0, percent: 0 };
      
      const progressData = await response.json() as Progress[];
      
      // Get lessons for this language to determine total
      const lessonsResponse = await fetch(`/api/languages/${languageCode}/lessons`);
      if (!lessonsResponse.ok) return { completed: 0, total: 0, percent: 0 };
      
      const lessons = await lessonsResponse.json();
      const total = lessons.length;
      const completed = progressData.filter(p => p.completed).length;
      const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return { completed, total, percent };
    } catch (error) {
      console.error(`Error calculating progress for ${languageCode}:`, error);
      return { completed: 0, total: 0, percent: 0 };
    }
  };
  
  if (isLoadingUser || isLoadingLanguages) {
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
        <p className="text-muted-foreground mb-6">Your account details</p>
        
        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
          <div>
            <p className="text-sm font-medium">Username</p>
            <p className="text-muted-foreground">{user.username}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Email</p>
            <p className="text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-zinc-800 pt-10">
        <h2 className="text-2xl font-bold mb-2">Language Courses</h2>
        <p className="text-muted-foreground mb-6">Your enrolled language courses and progress</p>
        
        {enrolledLanguages.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">You haven't started any language courses yet.</p>
            <p className="text-sm mt-2">Enroll in a course from the home page to get started.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {enrolledLanguages.map((language) => (
              <EnrolledLanguageCard 
                key={language.id} 
                language={language} 
                onResetProgress={handleResetProgress}
                resetMutation={resetProgressMutation}
                calculateProgress={calculateProgress}
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
        <h2 className="text-2xl font-bold mb-2 text-red-500">Danger Zone</h2>
        <p className="text-muted-foreground mb-6">Irreversible account actions</p>
        
        <div className="rounded-lg p-6 bg-red-950/20 border border-red-900">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-lg font-semibold text-red-400">Delete Account</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="whitespace-nowrap"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-red-500">
                    Delete Account Permanently?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    <p className="mb-4">
                      This will permanently delete your account, all your progress, and personal data.
                      This action <b>cannot be undone</b>.
                    </p>
                    <div className="bg-red-950/20 border border-red-900 rounded-md p-4 mb-4">
                      <p className="font-semibold mb-2">To confirm, type your username: <b>{user.username}</b></p>
                      <Input
                        type="text"
                        placeholder="Enter your username"
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
                      "Delete My Account"
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