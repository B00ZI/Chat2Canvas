'use client'

import { useCallback, useMemo, useState } from "react"
import { useProjectStore } from "@/store/projectStore"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface CardType {
  id: string
  title: string
  color: string
  tasks: { text: string; done: boolean }[]
}

interface CardDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  colId: string
  card: CardType
}

export function CardDetailsDrawer({
  open,
  onOpenChange,
  projectId,
  colId,
  card,
}: CardDetailsDrawerProps) {
  const toggleTask = useProjectStore(useCallback(s => s.toggleTask, []))
  const editCard = useProjectStore(useCallback(s => s.editCard, []))
  const deleteCard = useProjectStore(useCallback(s => s.deleteCard, []))

  const [title, setTitle] = useState(card.title)

  const completed = useMemo(
    () => card.tasks.filter(t => t.done).length,
    [card.tasks]
  )

  function handleTitleBlur() {
    if (title.trim() && title !== card.title) {
      editCard(projectId, colId, card.id, { title: title.trim() })
    }
  }

  function handleDeleteCard() {
    deleteCard(projectId, colId, card.id)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background">
        <DrawerHeader className="text-left">
          <DrawerTitle>Card details</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-6 space-y-6">

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">
              Title
            </label>

            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleTitleBlur}
              className="bg-card"
            />
          </div>

          {/* Tasks */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">
                Tasks
              </h4>

              <span className="text-xs text-muted-foreground">
                {completed}/{card.tasks.length} completed
              </span>
            </div>

            <div className="space-y-2">
              {card.tasks.map((task, idx) => (
                <label
                  key={idx}
                  className="
                    flex items-center gap-3
                    rounded-md border border-border
                    bg-card p-2
                    text-sm
                  "
                >
                  <input
                    type="checkbox"
                    checked={task.done}
                    onChange={() =>
                      toggleTask(projectId, colId, card.id, idx)
                    }
                    className="
                      h-4 w-4
                      rounded border-border
                      text-primary
                    "
                  />

                  <span
                    className={
                      task.done
                        ? "line-through text-muted-foreground"
                        : ""
                    }
                  >
                    {task.text}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Danger zone */}
          <div className="pt-4 border-t border-border">
            <Button
              variant="destructive"
              onClick={handleDeleteCard}
            >
              Delete card
            </Button>
          </div>

        </div>
      </DrawerContent>
    </Drawer>
  )
}