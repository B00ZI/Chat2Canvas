'use client'

import { useRef, useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useProjectStore } from "@/store/projectStore"
import { COLUMN_COLORS } from "@/lib/column-colors"


interface Task {
  text: string
  done: boolean
}

interface Card {
  id: string
  number: number
  title: string
  color: string
  tasks: Task[]
}

interface Column {
  id: string
  title: string
  color: string
  cards: Card[]
}

interface EditColumnDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
  col: Column
}

export function EditColumnDialog({
  open,
  onClose,
  projectId,
  col,
}: EditColumnDialogProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)

  const [selectedColor, setSelectedColor] = useState<string>(
    col.color
  )

  const editColumn = useProjectStore((state) => state.editColumn)


  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newTitle = titleInputRef.current?.value.trim()

    if (!newTitle || !selectedColor) return

    editColumn(projectId, col.id, {
      title: newTitle,
      color: selectedColor,
    })

    onClose()
  }



  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          bg-card text-card-foreground
          shadow-lg
        "
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-base">
            Edit column
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div className="space-y-4">
            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Column title
              </label>

              <Input
                ref={titleInputRef}
                type="text"
                defaultValue={col.title}
                autoFocus
              />
            </div>

            {/* Color picker */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Column color
              </label>

              <div className="grid grid-cols-6 gap-1">
                {COLUMN_COLORS.map((c) => {
                  const isSelected = selectedColor === c.value

                  return (
                    <button
                      key={c.name}
                      type="button"
                      onClick={() => setSelectedColor(c.value)}
                      className="
                        relative
                        h-8
                        rounded-lg
                        border border-border
                        ring-offset-accent-foreground
                        focus-visible:outline-none
                        focus-visible:ring-1
                        focus-visible:ring-ring
                      "
                      style={{ backgroundColor: c.value }}
                      aria-label={c.name}
                    >
                      {isSelected && (
                        <span
                          className="
                            absolute inset-0
                            rounded-[5px]
                            ring-2 ring-ring
                          "
                        />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant={'outline'} onClick={() => onClose()} type="button" className="" >
              Cancel
            </Button>
            <Button type="submit">
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
