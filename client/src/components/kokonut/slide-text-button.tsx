// Upstream: https://github.com/kokonut-labs/kokonutui/blob/83eec6d982d400a18438001a8efdbac1f159dd43/components/kokonutui/slide-text-button.tsx
// MIT. Compatibility changes are recorded in component-sources.json.
"use client";

/**
 * @author: @kokonut-labs
 * @description: Slide Text Button with animated vertical text transition
 * @version: 1.0.0
 * @date: 2025-11-02
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";

interface SlideTextButtonProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  text?: string;
  hoverText?: string;
  href?: string;
  className?: string;
  variant?: "default" | "ghost";
}

export default function SlideTextButton({
  text = "Browse Components",
  hoverText,
  href = "/docs",
  className,
  variant = "default",
  ...props
}: SlideTextButtonProps) {
  const slideText = hoverText ?? text;
  const variantStyles =
    variant === "ghost"
      ? "border border-black/10 text-black hover:bg-black/5 dark:border-white/10 dark:text-white dark:hover:bg-white/5"
      : "bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90";

  return (
    <motion.div
      animate={{ x: 0, opacity: 1, transition: { duration: 0.2 } }}
      className="relative"
      initial={false}
    >
      <Link
        className={cn(
          "group relative inline-flex h-10 items-center justify-center overflow-hidden rounded-lg px-8 font-medium text-md tracking-tighter transition-all duration-300 md:min-w-56",
          variantStyles,
          className
        )}
        href={href}
        aria-label={text}
        {...props}
      >
        <span aria-hidden="true" className="relative inline-block transition-transform duration-300 ease-in-out group-hover:-translate-y-full">
          <span className="flex items-center gap-2 opacity-100 transition-opacity duration-300 group-hover:opacity-0">
            <span className="font-medium">{text}</span>
          </span>
          <span className="absolute top-full left-0 flex items-center gap-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="font-medium">{slideText}</span>
          </span>
        </span>
      </Link>
    </motion.div>
  );
}
