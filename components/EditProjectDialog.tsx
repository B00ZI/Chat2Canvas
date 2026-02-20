'use client'

import { useRef } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useProjectStore } from "@/store/projectStore"

interface EditProjectDialogProps {
  open: boolean
  onClose: () => void
  projectName: string
  projectId: string
}

export function EditProjectDialog({
  open,
  onClose,
  projectName,
  projectId,
}: EditProjectDialogProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const editProject = useProjectStore((state) => state.editProject)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const name = inputRef.current?.value?.trim()
    if (!name) return

    editProject(projectId, name)

    if (inputRef.current) {
      inputRef.current.value = ""
    }

    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          bg-card text-card-foreground
          border border-border
          shadow-lg
          rounded-lg
        "
      >
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-sm font-semibold tracking-tight">
            Rename project
          </DialogTitle>
        </DialogHeader>

        <form
          className="space-y-5"
          onSubmit={handleSubmit}
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Project name
            </label>

            <Input
              ref={inputRef}
              type="text"
              defaultValue={projectName}
              autoFocus
              className="
                bg-background
                focus-visible:ring-1
                focus-visible:ring-ring
              "
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
            >
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
