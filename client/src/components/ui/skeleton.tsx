// Upstream: https://github.com/WatermelonCorp/watermellon-registry/blob/0099addd50a985bf53bdb81140ab4b72fc0668ce/src/components/ui/skeleton.tsx
// MIT. Compatibility changes are recorded in component-sources.json.
import * as React from "react"
import { cn } from "@/lib/utils"

const Skeleton = React.forwardRef<React.ElementRef<"div">, React.ComponentPropsWithoutRef<"div">>(({ className, ...props }, ref) => {
  return (
    <div ref={ref}
      data-slot="skeleton"
      className={cn("animate-pulse rounded-md bg-accent", className)}
      {...props}
    />
  )
})
Skeleton.displayName = "Skeleton"

export { Skeleton }
