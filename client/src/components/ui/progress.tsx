// Upstream: https://github.com/WatermelonCorp/watermellon-registry/blob/0099addd50a985bf53bdb81140ab4b72fc0668ce/src/components/ui/progress.tsx
// MIT. Compatibility changes are recorded in component-sources.json.
"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<React.ElementRef<typeof ProgressPrimitive.Root>, React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>>(({
  className,
  value,
  ...props
}, ref) => {
  return (
    <ProgressPrimitive.Root ref={ref}
      data-slot="progress"
      value={value}
      className={cn(
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = "Progress"

export { Progress }
