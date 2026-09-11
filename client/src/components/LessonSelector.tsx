import { useEffect, useMemo, useRef, useState } from 'react';
import type { Lesson } from '@shared/schema';
import { fetchCompletedLessonsByLanguage } from '@/lib/progress';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { BookOpen, CheckCircle2, ChevronRight } from 'lucide-react';

interface LessonSelectorProps {
  lessons: Lesson[];
  currentLessonId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSelectLesson: (lessonId: string) => void;
}

export default function LessonSelector({lessons,currentLessonId,isOpen,onClose,onSelectLesson}:LessonSelectorProps){
  const opener=useRef<HTMLElement|null>(null);
  const [completedLessons,setCompletedLessons]=useState<string[]>([]);
  const [loading,setLoading]=useState(false);
  const [progressError,setProgressError]=useState(false);
  const languageCode=lessons[0]?.languageCode;
  useEffect(()=>{
    if(!isOpen||!languageCode)return;
    let active=true;
    setLoading(true);setProgressError(false);setCompletedLessons([]);
    fetchCompletedLessonsByLanguage(languageCode).then(completed=>{
      if(active)setCompletedLessons(completed);
    }).catch(()=>{if(active)setProgressError(true);}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[isOpen,languageCode]);
  const sortedLessons=useMemo(()=>[...lessons].sort((a,b)=>Number(a.lessonId.match(/lesson(\d+)$/)?.[1]||0)-Number(b.lessonId.match(/lesson(\d+)$/)?.[1]||0)),[lessons]);
  const languageName=({de:'German',fr:'French',es:'Spanish',hi:'Hindi',zh:'Mandarin',ja:'Japanese',kn:'Kannada'} as Record<string,string>)[languageCode||''];
  return <Dialog open={isOpen} onOpenChange={open=>{if(!open)onClose();}}>
    <DialogContent className="course-picker-dialog" onOpenAutoFocus={()=>{opener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;}} onCloseAutoFocus={event=>{event.preventDefault();opener.current?.focus();}}>
      <DialogHeader><DialogTitle>{languageName?`${languageName} lessons`:'Choose a lesson'}</DialogTitle><DialogDescription>Every lesson is open. Choose where you would like to continue.</DialogDescription></DialogHeader>
      {loading&&<p role="status" className="text-sm text-muted-foreground">Loading your completion record…</p>}
      {progressError&&<p role="status" className="text-sm text-muted-foreground">Completion marks could not load. You can still open any lesson.</p>}
      <div className="course-picker-list">
        {sortedLessons.map(lesson=>{
          const completed=completedLessons.includes(lesson.lessonId),current=lesson.lessonId===currentLessonId;
          const number=lesson.lessonId.match(/lesson(\d+)$/)?.[1];
          return <Button type="button" variant="ghost" key={lesson.lessonId} aria-current={current?'page':undefined} className="course-picker-item" onClick={()=>{onSelectLesson(lesson.lessonId);onClose();}}>
            {completed?<CheckCircle2 aria-hidden="true"/>:<BookOpen aria-hidden="true"/>}
            <span><span>{number?`Lesson ${Number(number)}: `:''}{lesson.title}</span>{(completed||current)&&<small>{current?'Current lesson':''}{current&&completed?' · ':''}{completed?'Completed':''}</small>}</span>
            <ChevronRight aria-hidden="true"/>
          </Button>;
        })}
      </div>
    </DialogContent>
  </Dialog>;
}
