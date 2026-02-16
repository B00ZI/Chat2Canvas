"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"
import { cn } from "@/lib/utils"
import { Sun, Moon } from "lucide-react"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    ref={ref}
    className={cn(
      "group inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border border-input transition-colors",
      "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
      "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
      className
    )}
    {...props}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "pointer-events-none relative flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-sm transition-transform",
        "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
      )}
    >
      {/* Sun (Light mode) */}
      <Sun
        className="h-3 w-3 text-muted-foreground
                   group-data-[state=checked]:hidden"
      />

      {/* Moon (Dark mode) */}
      <Moon
        className="absolute h-3 w-3 text-primary
                   hidden group-data-[state=checked]:block"
      />
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
))

Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
