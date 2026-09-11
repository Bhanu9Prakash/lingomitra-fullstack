// Upstream: https://github.com/WatermelonCorp/watermellon-registry/blob/0099addd50a985bf53bdb81140ab4b72fc0668ce/src/components/ui/label.tsx
// MIT. Compatibility changes are recorded in component-sources.json.
import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"

import { cn } from "@/lib/utils"

const Label = React.forwardRef<React.ElementRef<typeof LabelPrimitive.Root>, React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>>(({
  className,
  ...props
}, ref) => {
  return (
    <LabelPrimitive.Root ref={ref}
      data-slot="label"
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
})
Label.displayName = "Label"

export { Label }
