'use client'

import { useState } from "react"
import { useProjectStore } from "@/store/projectStore"
import { EditCardDialog } from "@/components/EditCardDialog"
import { ConfirmDeleteDialog } from "@/components/ConfirmDeleteDialog"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { Button } from "@/components/ui/button"
import { PencilIcon, TrashIcon } from "lucide-react"

import type { Card as CardType } from "@/lib/types"

interface CardProps {
  card: CardType
  projectId: string
  colId: string
  dragHandleProps?: Record<string, unknown>
}

export function Card({ card, projectId, colId, dragHandleProps }: CardProps) {
  const [isEditCardDialogOpen, setIsEditCardDialogOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const toggleTask = useProjectStore((state) => state.toggleTask)
  const deleteCard = useProjectStore((state) => state.deleteCard)

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
          border border-border rounded-lg p-4
          shadow-xs hover:shadow-md transition
          relative group
        "
      >
        {/* Header / drag handle */}
        <div
          {...dragHandleProps}
          className="
            flex items-center gap-3 mb-3
            cursor-grab active:cursor-grabbing
            touch-none select-none
          "
        >
          {/* Title */}
          <h4 className="font-medium text-sm text-foreground flex-1 leading-snug truncate pointer-events-none">
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
        <div className="flex flex-col gap-2 cursor-default">
          {tasks.slice(0, 3).map((task, idx) => (
            <div
              key={idx}
              className="flex items-center gap-2 text-sm pl-1"
            >
              <input
                type="checkbox"
                checked={task.done}
                onChange={() => toggleTask(projectId, colId, card.id, idx)}
                onPointerDown={(e) => e.stopPropagation()}
                className="
                  w-4 h-4 rounded border-border
                  text-primary focus:ring-ring
                  cursor-pointer
                "
              />

              <span
                className={`truncate flex-1 ${
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
            <p className="text-[11px] text-muted-foreground pl-5 mt-1">
              +{tasks.length - 3} more tasks
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="mt-3 pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">
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


