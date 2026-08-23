'use client'

import { Toaster as Sonner, type ToasterProps } from "sonner"

/** Toast host themed by the app's design tokens — adapts to light/dark
 *  automatically because it references the semantic CSS variables. */
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      className="toaster group"
      position="bottom-right"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }
