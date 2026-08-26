"use client";

// Adapted from Motion Primitives' TransitionPanel (MIT).
// Source: https://motion-primitives.com/docs/transition-panel

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
  type Variants,
} from "motion/react";
import { cn } from "@/lib/utils";

const defaultVariants: Variants = {
  enter: { opacity: 0, y: 16, filter: "blur(3px)" },
  center: { opacity: 1, y: 0, filter: "blur(0px)" },
  exit: { opacity: 0, y: -10, filter: "blur(2px)" },
};

const defaultTransition: Transition = {
  type: "spring",
  stiffness: 320,
  damping: 32,
  mass: 0.8,
};

interface TransitionPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  activeIndex: number;
  children: React.ReactNode[];
  variants?: Variants;
  transition?: Transition;
}

export function TransitionPanel({
  activeIndex,
  children,
  className,
  variants = defaultVariants,
  transition = defaultTransition,
  ...props
}: TransitionPanelProps) {
  const shouldReduceMotion = useReducedMotion();
  const activePanel = children[activeIndex] ?? null;

  return (
    <div className={cn("transition-panel", className)} {...props}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.div
          key={activeIndex}
          initial={shouldReduceMotion ? "center" : "enter"}
          animate="center"
          exit={shouldReduceMotion ? "center" : "exit"}
          variants={variants}
          transition={shouldReduceMotion ? { duration: 0 } : transition}
        >
          {activePanel}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
