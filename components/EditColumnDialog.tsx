'use client'

import { useRef } from "react"
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
  const colorInputRef = useRef<HTMLInputElement>(null)

  const editColumn = useProjectStore((state) => state.editColumn)
  const deleteColumn = useProjectStore((state) => state.deleteColumn)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const newTitle = titleInputRef.current?.value.trim()
    const newColor = colorInputRef.current?.value.trim()

    if (!newTitle || !newColor) return

    editColumn(projectId, col.id, {
      title: newTitle,
      color: newColor,
    })

    onClose()
  }

  function handleDelete() {
    deleteColumn(projectId, col.id)
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
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Column title
              </label>
              <Input
                ref={titleInputRef}
                type="text"
                defaultValue={col?.title}
                autoFocus
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-foreground">
                Column color
              </label>

              <Input
                ref={colorInputRef}
                type="color"
                defaultValue={col?.color}
                className="
                  h-10 p-1
                  cursor-pointer
                "
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" className="flex-1">
              Save changes
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="destructive"
                  className="flex-1"
                >
                  Delete
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent
                className="
                  bg-popover text-popover-foreground
                  shadow-lg
                "
              >
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Delete “{col?.title}” column?
                  </AlertDialogTitle>

                  <AlertDialogDescription className="text-muted-foreground">
                    This action cannot be undone. This will permanently delete
                    this column.
                  </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>
                    Cancel
                  </AlertDialogCancel>

                  <AlertDialogAction
                    onClick={handleDelete}
                    className="
                      bg-destructive text-destructive-foreground
                      hover:opacity-90
                    "
                  >
                    Delete column
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
