import type { ReactNode } from 'react';
import { Progress } from './ui/progress';
import type { TeachingStep } from '@shared/learning';
import { motion, useReducedMotion } from 'motion/react';
import { Card } from './ui/card';

type Props = {
  title: string;
  step: TeachingStep;
  stepIndex: number;
  totalSteps: number;
  review?: boolean;
  busy: boolean;
  navigation: ReactNode;
  children: ReactNode;
};

/** Presentation only. The server owns progression, assessment and saved evidence. */
export default function LessonWorkspace({ title, step, stepIndex, totalSteps, review, busy, navigation, children }: Props) {
  const constructing = step.kind === 'construct' || step.kind === 'context';
  const reducedMotion = useReducedMotion();
  const quiet = reducedMotion !== false || constructing || step.kind === 'prior' || step.kind === 'understand';
  return <main className="guided-shell guided-workspace" aria-busy={busy} data-constructing={constructing}>
    <nav className="guided-nav" aria-label="Lesson navigation">{navigation}</nav>
    <Card className="learning-layout">
      <div className="learning-main"><div className="learning-column">
        <div className="guided-progress"><div><span>{review ? 'Return practice' : title}</span><span>{stepIndex + 1} / {totalSteps}</span></div><Progress value={(stepIndex + 1) / totalSteps * 100} aria-label="Position in this activity, not a mastery score" /></div>
        {/* A keyed Motion element removes the old example immediately. Assessment
            and draft-save updates never retain outgoing lesson content. */}
        <motion.div key={step.id} initial={quiet ? false : { opacity: .72 }} animate={{ opacity: 1 }} transition={{ duration: quiet ? 0 : .16 }}>{children}</motion.div>
      </div></div>
    </Card>
  </main>;
}
