'use client'

import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useProjectStore } from "@/store/projectStore"
import { COLUMN_COLORS } from "@/lib/column-colors"

interface NewColumnDialogProps {
  open: boolean
  onClose: () => void
  projectId: string
}

export function NewColumnDialog({
  open,
  onClose,
  projectId,
}: NewColumnDialogProps) {
  const titleInputRef = useRef<HTMLInputElement>(null)

  // default to first palette color
 const [selectedColor, setSelectedColor] = useState<string>(
  COLUMN_COLORS[0].value
)

  const addColumn = useProjectStore((state) => state.addColumn)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const title = titleInputRef.current?.value.trim()

    if (!title || !selectedColor) return

    addColumn(projectId, title, selectedColor)
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
            Create column
          </DialogTitle>

          <DialogDescription className="text-muted-foreground">
            Set the column title and choose a color.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Column title
            </label>

            <Input
              ref={titleInputRef}
              type="text"
              placeholder="e.g. Frontend"
              autoFocus
            />
          </div>

          {/* Color picker */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Column color
            </label>

            <div className="grid grid-cols-6 gap-2">
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
                      ring-offset-background
                      focus-visible:outline-none
                      focus-visible:ring-2
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

          <div className="pt-2">
            <Button type="submit" className="w-full">
              Create column
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
