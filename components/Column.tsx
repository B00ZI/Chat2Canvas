'use client'

import { useState, useRef, useLayoutEffect, useMemo, memo, Fragment } from "react"
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SortableCard from "@/components/SortableCard"
import { EditColumnDialog } from "@/components/EditColumnDialog"
import { NewCardDialog } from "@/components/NewCardDialog"
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog"
import { useProjectStore, TEST_MODE } from "@/store/projectStore"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { PencilIcon, TrashIcon, MoreVertical, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Column as ColumnType } from "@/lib/types"

interface ColumnProps {
  col: ColumnType
  projectId: string
  isDndActive: React.RefObject<boolean>
  isDropTarget?: boolean
  hoveredCardId?: string | null
  landedCardId?: string | null
}

const Column = memo(function Column({ col, projectId, isDndActive, isDropTarget, hoveredCardId, landedCardId }: ColumnProps) {
  const [isEditColumnDialogOpen, setIsEditColumnDialogOpen] = useState(false)
  const [isNewCardDialogOpen, setisNewCardDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const deleteColumn = useProjectStore((state) => state.deleteColumn)

  const {
    setNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: col.id,
    data: {
      type: "Column",
      col,
    },
  })

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
    willChange: 'transform',
  }

  const cardIds = useMemo(() => col.cards.map(card => card.id), [col.cards])

  // Where the "Drop here" indicator sits: before the hovered card, or at the
  // end of the list when hovering the column body / empty bottom area.
  const hoveredIdx = hoveredCardId
    ? col.cards.findIndex((c) => c.id === hoveredCardId)
    : -1
  const dropIndex = isDropTarget
    ? hoveredIdx >= 0 ? hoveredIdx : col.cards.length
    : -1

  const dropIndicator = (
    <div className="card-drop-in h-24 rounded-xl border-2 border-dashed border-muted bg-muted/30 flex items-center justify-center opacity-50">
      <span className="text-sm font-medium text-muted-foreground">Drop here</span>
    </div>
  )

  // ── FLIP: smooth displacement for cards making room ───────────────
  // Whenever layout shifts (indicator mounts/moves/unmounts, a card is
  // removed or added), every card glides from its previous position to
  // the new one instead of jumping.
  //
  // Measures offsetTop — NOT getBoundingClientRect — because offsetTop
  // ignores CSS transforms and scroll position. Rect-based baselines
  // would read back our own mid-glide transforms and compound every
  // render (cards drifting away, scrollHeight exploding).
  const listRef = useRef<HTMLDivElement>(null)
  const prevTopsRef = useRef<Map<string, number>>(new Map())

  useLayoutEffect(() => {
    const root = listRef.current
    if (!root) return

    const els = Array.from(root.querySelectorAll<HTMLElement>("[data-card-id]"))
    const prev = prevTopsRef.current
    const next = new Map<string, number>()
    const flips: { el: HTMLElement; dy: number }[] = []

    for (const el of els) {
      const id = el.dataset.cardId!
      const top = el.offsetTop
      next.set(id, top)
      const old = prev.get(id)
      if (old !== undefined) {
        const dy = old - top
        if (Math.abs(dy) > 1) flips.push({ el, dy })
      }
    }
    prevTopsRef.current = next
    if (flips.length === 0) return

    // Invert: park each moved card at its old position, no transition
    for (const { el, dy } of flips) {
      el.style.transition = "none"
      el.style.transform = `translateY(${dy}px)`
    }
    // Force reflow so the inverted position commits
    void root.offsetHeight
    // Play: glide to natural (current layout) position
    requestAnimationFrame(() => {
      for (const { el } of flips) {
        el.style.transition = "transform 260ms cubic-bezier(0.22,1,0.36,1)"
        el.style.transform = ""
      }
    })
  })
  // ── End FLIP ──────────────────────────────────────────────────────

  // ── Height animation ──────────────────────────────────────────────
  // Single effect: prevHeightRef holds the height from the PREVIOUS render.
  // When card count changes, we animate from old → new.
  const wrapperRef = useRef<HTMLDivElement>(null)
  const prevCardCountRef = useRef(col.cards.length)
  const prevHeightRef = useRef(0)

  useLayoutEffect(() => {
    const el = wrapperRef.current
    if (!el) return

    const newCount = col.cards.length
    const oldCount = prevCardCountRef.current
    prevCardCountRef.current = newCount

    // First render: just capture height, no animation
    if (prevHeightRef.current === 0) {
      prevHeightRef.current = el.getBoundingClientRect().height
      return
    }

    if (oldCount === newCount) {
      prevHeightRef.current = el.getBoundingClientRect().height
      return
    }

    // Skip animation during active drag — let dnd-kit handle visuals via transforms
    if (isDndActive.current) {
      prevHeightRef.current = el.getBoundingClientRect().height
      return
    }

    const newHeight = el.getBoundingClientRect().height
    const oldHeight = prevHeightRef.current

    if (oldHeight === newHeight) {
      prevHeightRef.current = newHeight
      return
    }

    el.style.height = `${oldHeight}px`
    el.style.overflow = "hidden"
    el.style.setProperty("transition", "height 200ms cubic-bezier(0.2, 0, 0, 1)", "important")

    requestAnimationFrame(() => {
      el.style.height = `${newHeight}px`
    })

    setTimeout(() => {
      el.style.transition = ""
      el.style.height = ""
      el.style.overflow = ""
      el.style.removeProperty("transition")
    }, 240)

    prevHeightRef.current = newHeight
  }, [col.cards.length, isDndActive])
  // ── End height animation ──────────────────────────────────────────

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        data-board-item
        suppressHydrationWarning
        className="w-80 shrink-0 relative rounded-xl border-2 border-dashed border-border bg-muted/30 min-h-48 flex items-center justify-center opacity-50"
      />
    )
  }

  function handleDelete() {
    if (!TEST_MODE) {
      deleteColumn(projectId, col.id)
      toast.success(`"${col.title}" deleted`)
    }
  }

  return (
    <>
      <div
        ref={(node) => {
          setNodeRef(node)
          wrapperRef.current = node
        }}
        style={style}
        data-board-item
        suppressHydrationWarning
        className="w-80 shrink-0 flex flex-col
                   rounded-xl border border-border
                   shadow-xs bg-card"
      >
        {/* Column header: spine dot + title + count pill */}
        <div className="p-4 pb-0">
          <div
            {...attributes}
            {...listeners}
            className="flex items-start justify-between gap-2
                       cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex min-w-0 items-center gap-2.5">
              {col.color && (
                <span
                  aria-hidden
                  className="mt-px size-3 shrink-0 rounded-full shadow-xs"
                  style={{ backgroundColor: col.color }}
                />
              )}

              <div className="flex min-w-0 flex-col">
                <h3 className="max-w-[9rem] truncate text-sm font-semibold tracking-tight text-foreground">
                  {col.title}
                </h3>
              </div>

              <span className="bg-muted text-muted-foreground mt-px shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium leading-none tabular-nums">
                {col.cards.length}
              </span>
            </div>

            {/* Column menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Options for ${col.title}`}
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="
                    -mr-1 size-7 rounded-md
                    text-muted-foreground
                    hover:text-foreground
                    hover:bg-muted
                    focus-visible:ring-ring focus-visible:ring-1
                  "
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="min-w-36"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsEditColumnDialogOpen(true)
                    }}
                  >
                    <PencilIcon className="mr-2 h-4 w-4" />
                    Edit column
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDeleteOpen(true)
                    }}
                  >
                    <TrashIcon className="mr-2 h-4 w-4" />
                    Delete column
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Cards container */}
        <div
          ref={listRef}
          className="scrollbar-slim overflow-y-auto overflow-x-hidden py-3 px-4 space-y-3
                     max-h-[calc(80vh-8rem)]"
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {col.cards.map((card, i) => (
              <Fragment key={card.id}>
                {isDropTarget && i === dropIndex && dropIndicator}
                <SortableCard
                  card={card}
                  projectId={projectId}
                  colId={col.id}
                  justLanded={landedCardId === card.id}
                />
              </Fragment>
            ))}
            {isDropTarget && dropIndex >= col.cards.length && dropIndicator}
          </SortableContext>
        </div>

        {/* Add new card — same ghost-tile affordance as Add Column */}
        <div className="p-4 pt-1">
          <button
            onClick={() => setisNewCardDialogOpen(true)}
            className="
              w-full flex items-center justify-center gap-1.5
              cursor-pointer border border-dashed border-border
              rounded-xl p-2 text-sm font-medium text-muted-foreground
              transition-colors duration-150
              hover:border-primary/50 hover:bg-primary/5 hover:text-primary
              focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none
            "
          >
            <PlusIcon className="size-4" />
            Add card
          </button>
        </div>
      </div>

      {/* Dialogs */}

      <EditColumnDialog
        open={isEditColumnDialogOpen}
        onClose={() => setIsEditColumnDialogOpen(false)}
        projectId={projectId}
        col={col}
      />

      <NewCardDialog
        open={isNewCardDialogOpen}
        onClose={() => setisNewCardDialogOpen(false)}
        colId={col.id}
        projectId={projectId}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={`Delete "${col.title}"?`}
        description="This action cannot be undone. This will permanently delete this column and all its cards."
        confirmLabel="Delete column"
        onConfirm={handleDelete}
      />
    </>
  )
})

export default Column
