"use client"

// Motion treatment adapted from Watermelon's Progress component (MIT).
// Source: https://ui.watermelon.sh/

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

const MotionProgressIndicator = motion.create(ProgressPrimitive.Indicator)

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => {
  const shouldReduceMotion = useReducedMotion()
  const resolvedValue = Math.min(100, Math.max(0, value ?? 0))

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={resolvedValue}
      data-slot="progress"
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <MotionProgressIndicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary"
        initial={false}
        animate={{ x: `-${100 - resolvedValue}%` }}
        transition={shouldReduceMotion
          ? { duration: 0 }
          : { type: "spring", stiffness: 240, damping: 30, mass: 0.7 }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
