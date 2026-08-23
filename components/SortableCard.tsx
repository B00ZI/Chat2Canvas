'use client'

import { memo, useMemo } from "react"
import { useSortable } from "@dnd-kit/sortable"

import CardPreview from "@/components/CardPreview"
import { Card } from "@/lib/types"

interface SortableCardProps {
  card: Card
  projectId: string
  colId: string
  justLanded?: boolean
}

const SortableCard = memo(function SortableCard({
  card,
  projectId,
  colId,
  justLanded,
}: SortableCardProps) {
  const {
    setNodeRef,
    isDragging,
    attributes,
    listeners,
  } = useSortable({
    id: card.id,
    data: useMemo(() => ({ type: "Card" as const, card }), [card]),
  })

  // No transform here: positional smoothing is handled by the parent
  // Column's FLIP animation. The dragged card's slot collapses instantly —
  // the DragOverlay covers the visual, and FLIP glides the displaced cards.
  const style = useMemo(() => ({
    zIndex: isDragging ? 50 : undefined,
    height: isDragging ? 0 : undefined,
    overflow: isDragging ? "hidden" : undefined,
  }), [isDragging])

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-card-id={card.id}
      suppressHydrationWarning
      className="touch-none"
    >
      <div
        suppressHydrationWarning
        className={justLanded ? "card-land" : undefined}
      >
        <CardPreview
          card={card}
          projectId={projectId}
          colId={colId}
          dragHandleProps={{ ...attributes, ...listeners }}
        />
      </div>
    </div>
  )
})

export default SortableCard
