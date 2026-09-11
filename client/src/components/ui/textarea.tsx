// Upstream: https://github.com/WatermelonCorp/watermellon-registry/blob/0099addd50a985bf53bdb81140ab4b72fc0668ce/src/components/ui/textarea.tsx
// MIT. Compatibility changes are recorded in component-sources.json.
import * as React from "react"

import { cn } from "@/lib/utils"

const Textarea = React.forwardRef<React.ElementRef<"textarea">, React.ComponentPropsWithoutRef<"textarea">>(({ className, ...props }, ref) => {
  return (
    <textarea ref={ref}
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-[color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:ring-destructive/40",
        className
      )}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
