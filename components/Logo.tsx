/**
 * Chat2Canvas brand mark: two overlapping canvas sheets bridged by a node —
 * the conversation-to-canvas connection. Stroke-based, monochrome,
 * background-free.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className={className}
    >
      {/* Back sheet */}
      <rect
        x="3.25"
        y="6.75"
        width="11"
        height="11"
        rx="2.75"
        stroke="currentColor"
        strokeWidth="1.7"
        opacity="0.45"
      />
      {/* Front sheet */}
      <rect
        x="9.75"
        y="3.25"
        width="11"
        height="11"
        rx="2.75"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      {/* Bridge node at the overlap */}
      <circle cx="12" cy="10.5" r="2" fill="currentColor" />
    </svg>
  )
}

interface LogoProps {
  /** Mark size utility class, e.g. "size-6" */
  markClassName?: string
  wordmark?: boolean
  className?: string
}

export function Logo({ markClassName = "size-6", wordmark = true, className }: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className={`${markClassName} shrink-0`} />
      {wordmark && (
        <span className="font-display text-lg leading-none font-semibold tracking-tight">
          Chat<span className="text-primary">2</span>Canvas
        </span>
      )}
    </span>
  )
}
