import { Lesson } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import LearningLoop from "./LearningLoop";
import { useState } from 'react';
import { Button } from './ui/button';
import { learningApi } from '@/lib/learning-api';
import { Link } from 'wouter';

interface LessonContentProps {
  lesson: Lesson;
  isLoading: boolean;
  error?: string;
  nextLesson: Lesson | null;
  prevLesson: Lesson | null;
  onNavigate: (lessonId: string) => void;
}

export default function LessonContent({
  lesson,
  isLoading,
  error,
  nextLesson,
  prevLesson,
  onNavigate,
}: LessonContentProps) {
  const [notesOpen,setNotesOpen]=useState(false),[notesError,setNotesError]=useState('');
  async function toggleNotes(){if(notesOpen){setNotesOpen(false);return;}try{await learningApi('/api/learning/support',{languageCode:lesson.languageCode,source:'notes',lessonId:lesson.lessonId});setNotesOpen(true);setNotesError('');}catch(e){setNotesError((e as Error).message);}}
  if (isLoading) {
    return <div className="lesson-loading" aria-live="polite">Preparing your lesson…</div>;
  }

  if (error) {
    return <div className="lesson-error" role="alert">{error}</div>;
  }

  return (
    <article className="lesson-experience">
      <LearningLoop key={lesson.lessonId} lesson={lesson} nextLesson={nextLesson} prevLesson={prevLesson} onNavigate={onNavigate} />
      <section className="lesson-source-notes">
        <Button variant="ghost" aria-expanded={notesOpen} onClick={toggleNotes}>{notesOpen?'Close the lesson notes':'Open the lesson notes and examples'}</Button>
        {notesError&&<p role="alert">{notesError}</p>}
        {notesOpen&&<>
        <p className="p-4 text-sm text-muted-foreground">These are the original course materials, preserved for reference. Human review status is not verified. Practice answers are examples and may not list every natural alternative.</p>
        <div className="lesson-markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{lesson.content}</ReactMarkdown>
        </div>
        </>}
      </section>
      <p className="lesson-source-notes"><Link href={`/contact?lesson=${encodeURIComponent(lesson.lessonId)}`}>Report a confusing part of this lesson</Link></p>
    </article>
  );
}
