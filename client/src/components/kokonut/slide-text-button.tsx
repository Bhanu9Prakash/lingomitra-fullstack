"use client";

// Adapted from Kokonut UI's Slide Text Button (MIT).
// Source: https://github.com/kokonut-labs/kokonutui

import * as React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";

interface SlideTextButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  text: string;
  hoverText?: string;
  icon?: React.ReactNode;
}

export function SlideTextButton({
  text,
  hoverText = text,
  icon,
  className,
  type = "button",
  ...props
}: SlideTextButtonProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      className="kokonut-slide-button-shell"
      initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <button type={type} className={cn("kokonut-slide-button", className)} aria-label={text} {...props}>
        <span className="kokonut-slide-button-copy" aria-hidden="true">
          <span>{text}</span>
          <span>{hoverText}</span>
        </span>
        {icon ? <span className="kokonut-slide-button-icon" aria-hidden="true">{icon}</span> : null}
      </button>
    </motion.div>
  );
}
