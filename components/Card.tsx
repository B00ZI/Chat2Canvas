'use client'

import { memo, useState, useCallback } from "react"
import { useProjectStore } from "@/store/projectStore"
import { EditCardDialog } from "./EditCardDialog"
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon } from "lucide-react"

interface CardType {
  id: string
  number: number
  title: string
  color: string
  tasks: { text: string; done: boolean }[]
}

interface CardProps {
  card: CardType
  projectId: string
  colId: string
  dragHandleProps?: any
}

function Card({ card, projectId, colId, dragHandleProps }: CardProps) {
  const [isEditCardDialogOpen, setIsEditCardDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const toggleTask = useProjectStore(
    useCallback((state) => state.toggleTask, [])
  )

  const deleteCard = useProjectStore(
    useCallback((state) => state.deleteCard, [])
  )

  const tasks = card?.tasks || []
  const completedTasks = tasks.filter(t => t?.done).length || 0

  function handleDelete() {
    deleteCard(projectId, colId, card.id)
  }

  return (
    <>
      <div
        className="
          bg-card text-card-foreground w-full
          border border-border rounded-lg p-3
          shadow-xs hover:shadow-md transition
          relative group
        "
      >
        {/* Header / drag handle */}
        <div
          {...dragHandleProps}
          className="
            flex items-start gap-2 mb-2
            cursor-grab active:cursor-grabbing
            touch-none select-none
          "
        >
          {/* Number badge */}
          <div
            className="
              w-7 h-7 rounded-md
              flex items-center justify-center
              text-white text-xs font-semibold
              shrink-0 shadow-xs pointer-events-none
            "
            style={{ backgroundColor: card.color, willChange: 'transform' }}
          >
            {card.number}
          </div>

          {/* Title */}
          <h4 className="font-medium text-sm text-foreground flex-1 leading-snug wrap-break-word pointer-events-none">
            {card.title}
          </h4>

          {/* Card menu */}
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
                  opacity-0 group-hover:opacity-100 group-focus-within:opacity-100
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
                    setIsEditCardDialogOpen(true)
                  }}
                >
                  <PencilIcon className="mr-2 h-4 w-4" />
                  Edit card
                </DropdownMenuItem>

                <DropdownMenuItem
                  variant="destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDeleteOpen(true)
                  }}
                >
                  <TrashIcon className="mr-2 h-4 w-4" />
                  Delete card
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Tasks preview */}
        <div className="space-y-1.5 cursor-default">
          {tasks.slice(0, 3).map((task, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-xs"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(projectId, colId, card.id, idx)}
                onPointerDown={(e) => e.stopPropagation()}
                className="
                  rounded border-border
                  text-primary focus:ring-ring
                  cursor-pointer
                "
              />

              <span
                className={`truncate ${
                  task.done
                    ? "line-through text-muted-foreground"
                    : "text-foreground"
                }`}
              >
                {task.text}
              </span>
            </div>
          ))}

          {tasks.length > 3 && (
            <p className="text-[11px] text-muted-foreground pl-5">
              +{tasks.length - 3} more tasks
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-border flex items-center justify-between cursor-default">
          <span className="text-[11px] text-muted-foreground font-medium">
            {completedTasks}/{tasks.length} completed
          </span>
        </div>
      </div>

      {/* Dialogs */}

      <EditCardDialog
        open={isEditCardDialogOpen}
        onClose={() => setIsEditCardDialogOpen(false)}
        projectId={projectId}
        colId={colId}
        card={card}
      />

      <ConfirmDeleteDialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title={`Delete "${card.title}"?`}
        description="This action cannot be undone. This will permanently delete this card."
        confirmLabel="Delete card"
        onConfirm={handleDelete}
      />
    </>
  )
}

export default memo(Card)
