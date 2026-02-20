'use client'

import { useState, useMemo, memo } from "react"
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SortableCard from "./SortableCard"
import { EditColumnDialog } from "./EditColumnDialog"
import { NewCardDialog } from "./NewCardDialog "
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog"
import { useProjectStore } from "@/store/projectStore"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { PencilIcon, TrashIcon } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ColumnProps {
  col: {
    id: string
    title: string
    color: string
    cards: any[]
  }
  projectId: string
}

const Column = memo(function Column({ col, projectId }: ColumnProps) {
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

  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="w-80 shrink-0 relative rounded-lg border-2 border-dashed border-muted bg-muted/30 h-125 flex items-center justify-center opacity-50"
      />
    )
  }

  function handleDelete() {
    deleteColumn(projectId, col.id)
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        className="bg-card rounded-lg p-4 w-80 shrink-0 flex flex-col max-h-[80vh]
                   shadow-xs border border-border"
      >
        {/* Column header */}
        <div className="mb-4">
          <div
            className="h-1 rounded-t-lg mb-3"
            style={{ backgroundColor: col.color }}
          />

          <div
            {...attributes}
            {...listeners}
            className="flex items-start justify-between gap-2
                       cursor-grab active:cursor-grabbing select-none"
          >
            <div className="flex flex-col min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate max-w-[9.5rem]">
                {col.title}
              </h3>
              <span className="text-[11px] text-muted-foreground font-medium tracking-wide">
                {col.cards.length} {col.cards.length === 1 ? "TASK" : "TASKS"}
              </span>
            </div>

            {/* Column menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  className="
                    h-7 w-7 rounded-md
                    text-muted-foreground
                    hover:text-foreground
                    hover:bg-muted
                    focus-visible:ring-1 focus-visible:ring-ring
                  "
                >
                  ⋮
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
          className="
            flex-1 overflow-y-auto overflow-x-hidden min-h-12.5 p-1.5 pr-2 space-y-3
            [&::-webkit-scrollbar]:w-[4px]
            [&::-webkit-scrollbar-track]:bg-sidebar [&::-webkit-scrollbar-track]:rounded-full
            [&::-webkit-scrollbar-thumb]:bg-sidebar-accent [&::-webkit-scrollbar-thumb]:rounded-full
            [&::-webkit-scrollbar-thumb:hover]:bg-primary
          "
        >
          <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
            {col.cards.map((card) => (
              <SortableCard
                key={card.id}
                card={card}
                projectId={projectId}
                colId={col.id}
              />
            ))}
          </SortableContext>
        </div>

        {/* Add new card */}
        <button
          onClick={() => setisNewCardDialogOpen(true)}
          className="
            mt-3 w-full flex items-center justify-center gap-2
            cursor-pointer border-2 border-dashed border-muted
            rounded-lg p-3 text-sm font-medium text-muted-foreground
            transition
            hover:bg-accent/20 hover:border-accent hover:text-accent-foreground
            focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring
          "
        >
          <span className="text-lg">+</span>
          Add new card
        </button>
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
