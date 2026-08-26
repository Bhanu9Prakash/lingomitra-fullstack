"use client";

// Adapted from Motion Primitives' AnimatedGroup (MIT).
// Source: https://motion-primitives.com/docs/animated-group

import * as React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { cn } from "@/lib/utils";

const itemPresets = {
  fade: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  slide: { hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } },
  scale: { hidden: { opacity: 0, scale: 0.96 }, visible: { opacity: 1, scale: 1 } },
} satisfies Record<string, Variants>;

interface AnimatedGroupProps {
  children: React.ReactNode;
  className?: string;
  preset?: keyof typeof itemPresets;
  itemVariants?: Variants;
  staggerChildren?: number;
  delayChildren?: number;
}

export function AnimatedGroup({
  children,
  className,
  preset = "fade",
  itemVariants,
  staggerChildren = 0.07,
  delayChildren = 0.02,
}: AnimatedGroupProps) {
  const shouldReduceMotion = useReducedMotion();
  const resolvedItemVariants = shouldReduceMotion
    ? { hidden: { opacity: 1 }, visible: { opacity: 1 } }
    : (itemVariants ?? itemPresets[preset]);

  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: shouldReduceMotion
        ? { duration: 0 }
        : { staggerChildren, delayChildren },
    },
  };

  return (
    <motion.div
      className={cn("animated-group", className)}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={React.isValidElement(child) && child.key != null ? child.key : index} variants={resolvedItemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
