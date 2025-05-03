import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, useLocation } from "wouter";
import { Lesson, Language } from "@shared/schema";
import LessonHeader from "@/components/LessonHeader";
import LessonContent from "@/components/LessonContent";
import LessonSelector from "@/components/LessonSelector";
import ChatUI from "@/components/ChatUI";
import MicrophonePermissionCheck from "@/components/MicrophonePermissionCheck";
import PaywallModal from "@/components/PaywallModal";
import { getQueryFn } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/hooks/use-auth";

export default function LessonView() {
  const [_, navigate] = useLocation();
  const { user } = useAuth();
  
  // Helper functions for lesson ID manipulation
  const getLessonNumber = (lessonId: string) => {
    const match = lessonId.match(/lesson(\d+)$/);
    return match ? parseInt(match[1]) : 0;
  };
  
  const extractLessonNumber = (lessonId: string) => {
    const match = lessonId.match(/lesson(\d+)$/);
    return match ? match[1] : "01";
  };
  
  // Get route params for all supported URL formats
  const [matchLanguage, paramsLanguage] = useRoute("/language/:code");
  const [matchLesson, paramsLesson] = useRoute("/lesson/:id");
  const [matchStandardRoute, paramsStandardRoute] = useRoute("/:language/lesson/:lessonNumber");
  
  // Extract parameters from URL
  const languageCode = paramsLanguage?.code || 
                       paramsStandardRoute?.language || 
                       (paramsLesson?.id ? paramsLesson.id.split('-')[0] : null);
                       
  // For the standard route, construct the lesson ID from language and lesson number
  let specificLessonId = paramsLesson?.id;
  if (paramsStandardRoute?.language && paramsStandardRoute?.lessonNumber) {
    const lessonNum = paramsStandardRoute.lessonNumber.padStart(2, '0');
    specificLessonId = `${paramsStandardRoute.language}-lesson${lessonNum}`;
  }
  
  // State for lesson modal and chat
  const [isLessonSelectorOpen, setLessonSelectorOpen] = useState(false);
  const [isChatActive, setIsChatActive] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  
  // Ref for chat component to access resetChatHistory method
  const chatRef = useRef<any>(null);
  
  // Fetch all languages
  const { data: languages } = useQuery<Language[]>({
    queryKey: ["/api/languages"],
    queryFn: getQueryFn(),
  });
  
  // Fetch language data if we have a language code
  const { data: language } = useQuery<Language>({
    queryKey: [`/api/languages/${languageCode}`],
    queryFn: getQueryFn(),
    enabled: !!languageCode,
  });
  
  // Fetch lessons for the selected language
  const { 
    data: lessons, 
    isLoading: lessonsLoading,
    error: lessonsError
  } = useQuery<Lesson[]>({
    queryKey: [`/api/languages/${languageCode}/lessons`],
    queryFn: getQueryFn(),
    enabled: !!languageCode,
  });
  
  // Fetch specific lesson if we have a lesson ID
  const {
    data: specificLesson,
    isLoading: specificLessonLoading,
    error: specificLessonError
  } = useQuery<Lesson>({
    queryKey: [`/api/lessons/${specificLessonId}`],
    queryFn: getQueryFn(),
    enabled: !!specificLessonId,
  });
  
  // Determine current lesson
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);
  
  // Set current lesson ID based on URL parameters
  useEffect(() => {
    if (specificLessonId) {
      setCurrentLessonId(specificLessonId);
      // Track lesson_start event when a lesson is loaded
      trackEvent('lesson_start', { 
        lesson_id: specificLessonId,
        language_code: specificLessonId.split('-')[0] 
      });
    } else if (lessons && lessons.length > 0 && !currentLessonId) {
      // If we have lessons but no current lesson, select the first one
      setCurrentLessonId(lessons[0].lessonId);
    }
  }, [specificLessonId, lessons, currentLessonId]);
  
  // Find current lesson object
  const currentLesson = specificLesson || 
    (lessons && currentLessonId 
      ? lessons.find(l => l.lessonId === currentLessonId) 
      : null);
      
  // Check if we need to show the paywall when the current lesson changes
  useEffect(() => {
    if (currentLesson && shouldShowPaywall(currentLesson)) {
      setIsPaywallOpen(true);
    } else {
      setIsPaywallOpen(false);
    }
  }, [currentLesson]);
  
  // Handle redirects from legacy URLs to new URL format
  useEffect(() => {
    if ((matchLanguage || matchLesson) && !matchStandardRoute && currentLesson) {
      // Extract language code and lesson number
      const langCode = currentLesson.languageCode;
      const lessonNumber = extractLessonNumber(currentLesson.lessonId);
      
      // Redirect to the new URL format
      navigate(`/${langCode}/lesson/${lessonNumber}`, { replace: true });
    }
  }, [matchLanguage, matchLesson, matchStandardRoute, currentLesson, navigate, extractLessonNumber]);
  
  // Sort lessons by number for proper navigation
  const sortedLessons = lessons ? [...lessons].sort((a, b) => 
    getLessonNumber(a.lessonId) - getLessonNumber(b.lessonId)
  ) : [];
  
  // Find next and previous lessons using sorted lessons
  const currentIndex = sortedLessons?.findIndex(l => l.lessonId === currentLessonId) ?? -1;
  const nextLesson = currentIndex >= 0 && sortedLessons && currentIndex < sortedLessons.length - 1 
    ? sortedLessons[currentIndex + 1] 
    : null;
  const prevLesson = currentIndex > 0 && sortedLessons 
    ? sortedLessons[currentIndex - 1] 
    : null;
  
  // Determine selected language
  const selectedLanguage = language || 
    (currentLesson && languages 
      ? languages.find(l => l.code === currentLesson.languageCode) 
      : null);
  
  // Navigation handlers - use new URL format
  const handleLessonSelect = (lessonId: string) => {
    // Extract language code and lesson number from the lesson ID
    const [langCode, lessonPart] = lessonId.split('-');
    const lessonNumber = extractLessonNumber(lessonPart || "lesson01");
    
    // Navigate to the new URL format
    navigate(`/${langCode}/lesson/${lessonNumber}`);
    setLessonSelectorOpen(false);
  };
  
  // Determine loading and error states
  const isLoading = lessonsLoading || specificLessonLoading;
  const error = lessonsError 
    ? "Failed to load lessons" 
    : specificLessonError 
      ? "Failed to load the selected lesson" 
      : "";
  
  // Toggle between chat and lesson content
  const handleToggleChat = () => {
    const newChatState = !isChatActive;
    setIsChatActive(newChatState);
    
    // Track chat_started event when chat is activated
    if (newChatState && currentLesson) {
      trackEvent('chat_started', { 
        lesson_id: currentLesson.lessonId,
        language_code: currentLesson.languageCode 
      });
    }
  };
  
  // Check if the user needs to see a paywall for this lesson
  const shouldShowPaywall = (lesson: Lesson) => {
    // Free tier gets access to the first two lessons only
    // All lessons beyond lesson 2 are premium
    const lessonNumber = getLessonNumber(lesson.lessonId);
    
    // Premium users get all lessons
    const isPremiumUser = user?.subscriptionTier === 'premium';
    
    // Show paywall for lessons beyond lesson 2 for non-premium users
    return lessonNumber > 2 && !isPremiumUser;
  };

  return (
    <div className="lesson-view">
      {/* Lesson header */}
      {selectedLanguage && currentLesson && (
        <LessonHeader 
          currentLesson={currentLesson}
          onOpenLessonSelector={() => setLessonSelectorOpen(true)}
          onToggleChat={handleToggleChat}
          isChatActive={isChatActive}
          onResetChat={() => {
            // Get the chat component reference and call its reset function
            if (chatRef.current && chatRef.current.resetChatHistory) {
              chatRef.current.resetChatHistory();
            }
          }}
        />
      )}
      
      {/* Spacer to account for fixed header height */}
      <div className="lesson-header-spacer"></div>

      {/* Main content */}
      <div className="container">
        {/* Microphone permission check - only show in lesson content mode */}
        {!isChatActive && <MicrophonePermissionCheck />}
        
        {/* Show chat UI or lesson content based on isChatActive */}
        {!currentLesson ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
          </div>
        ) : isChatActive ? (
          /* AI Tutor Chat UI - renders in full screen */
          <ChatUI ref={chatRef} lesson={currentLesson} />
        ) : (
          /* Regular Lesson Content */
          <LessonContent 
            lesson={currentLesson}
            isLoading={isLoading}
            error={error}
            nextLesson={nextLesson}
            prevLesson={prevLesson}
            onNavigate={handleLessonSelect}
          />
        )}
      </div>

      {/* Lesson selector modal */}
      {lessons && (
        <LessonSelector 
          lessons={lessons}
          currentLessonId={currentLessonId}
          isOpen={isLessonSelectorOpen}
          onClose={() => setLessonSelectorOpen(false)}
          onSelectLesson={handleLessonSelect}
        />
      )}
      
      {/* Paywall modal */}
      {currentLesson && (
        <PaywallModal
          isOpen={isPaywallOpen}
          onClose={() => setIsPaywallOpen(false)}
          lessonId={currentLesson.lessonId}
          languageCode={currentLesson.languageCode}
        />
      )}
    </div>
  );
}
