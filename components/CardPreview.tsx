'use client'

import { memo, useMemo, useState } from "react"
import { CardDetailsDrawer } from "./CardDetailsDrawer"

interface CardType {
  id: string
  title: string
  color: string
  tasks: { text: string; done: boolean }[]
}

interface CardPreviewProps {
  card: CardType
  projectId: string
  colId: string
  dragHandleProps?: any
}

function CardPreview({
  card,
  projectId,
  colId,
  dragHandleProps,
}: CardPreviewProps) {
  const [open, setOpen] = useState(false)

  const { completed, total } = useMemo(() => {
    const total = card.tasks?.length ?? 0
    const completed = card.tasks?.filter(t => t.done).length ?? 0
    return { completed, total }
  }, [card.tasks])

  return (
    <>
      <div
        {...dragHandleProps}
        onClick={() => setOpen(true)}
        className="
          w-full rounded-lg
          p-3
          shadow-xs hover:shadow-sm transition
          cursor-pointer
          flex flex-col
          select-none
        "
        style={{ backgroundColor: card.color }}
      >
        {/* Title */}
        <h4
          className="
            text-sm font-medium leading-snug
            line-clamp-2 wrap-break-word
            text-white
          "
        >
          {card.title}
        </h4>

        {/* Footer */}
        <div className="mt-3 text-[11px] text-white/80">
          {completed}/{total} completed
        </div>
      </div>

      <CardDetailsDrawer
        open={open}
        onOpenChange={setOpen}
        projectId={projectId}
        colId={colId}
        card={card}
      />
    </>
  )
}

export default memo(CardPreview)