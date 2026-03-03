'use client'

import { useEffect, useRef, useState } from "react"
import { useProjectStore } from "@/store/projectStore"
import { COLUMN_COLORS } from "@/lib/column-colors"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Task {
  text: string
  done: boolean
}

interface Card {
  id: string
  title: string
  color: string
  tasks: Task[]
}

interface CardDetailsDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  colId: string
  card: Card
}

export function CardDetailsDrawer({
  open,
  onOpenChange,
  projectId,
  colId,
  card,
}: CardDetailsDrawerProps) {

  const editCard = useProjectStore(state => state.editCard)
  const deleteCard = useProjectStore(state => state.deleteCard)

  const titleInputRef = useRef<HTMLInputElement>(null)
  const taskInputRef = useRef<HTMLInputElement>(null)

  const [tasks, setTasks] = useState<Task[]>([])
  const [selectedColor, setSelectedColor] = useState(card.color)

  useEffect(() => {
    if (!open) return

    setTasks(card.tasks)
    setSelectedColor(card.color)

    requestAnimationFrame(() => {
      titleInputRef.current?.focus()
    })
  }, [open, card.id])

  function handleAddTask() {
    const text = taskInputRef.current?.value.trim()
    if (!text) return

    setTasks(prev => [...prev, { text, done: false }])
    taskInputRef.current!.value = ""
  }

  function handleDeleteTask(index: number) {
    setTasks(prev => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const title = titleInputRef.current?.value.trim()
    if (!title) return

    editCard(projectId, colId, card.id, {
      title,
      color: selectedColor,
      tasks,
    })

    onOpenChange(false)
  }

  function handleDeleteCard() {
    deleteCard(projectId, colId, card.id)
    onOpenChange(false)
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent
        className="
          bg-card text-card-foreground
          border border-border
        "
      >
        <DrawerHeader className="space-y-1 text-left">
          <DrawerTitle className="text-sm font-semibold tracking-tight">
            Edit card
          </DrawerTitle>
          <DrawerDescription className="text-sm text-muted-foreground">
            Update card details and tasks.
          </DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit}
          className="px-4 pb-6 space-y-6"
        >

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">
              Card title
            </label>

            <Input
              ref={titleInputRef}
              defaultValue={card.title}
              className="
                bg-background
                focus-visible:ring-1
                focus-visible:ring-ring
              "
            />
          </div>

          {/* Color */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-foreground">
              Card color
            </label>

            <div className="grid grid-cols-4 gap-1.5">
              {COLUMN_COLORS.map((c) => {
                const selected = selectedColor === c.value

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
                      focus-visible:ring-1
                      focus-visible:ring-ring
                    "
                    style={{ backgroundColor: c.value }}
                    aria-label={c.name}
                  >
                    {selected && (
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

          {/* Tasks */}
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium text-foreground">
              Tasks
            </label>

            {/* Add task */}
            <div className="flex gap-2">
              <Input
                ref={taskInputRef}
                placeholder="Add a task…"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleAddTask()
                  }
                }}
                className="
                  bg-background
                  focus-visible:ring-1
                  focus-visible:ring-ring
                "
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleAddTask}
                className="shrink-0"
              >
                Add task
              </Button>
            </div>

            {/* Task list */}
            <div className="flex flex-col gap-3 max-h-72 overflow-y-auto pr-1">
              {[...tasks].reverse().map((task, reversedIndex) => {
                const actualIndex = tasks.length - 1 - reversedIndex

                return (
                  <div
                    key={actualIndex}
                    className="
                      flex items-center gap-3
                      rounded-lg
                      border border-border
                      bg-background
                      px-3 py-2
                    "
                  >
                    <Input
                      value={task.text}
                      onChange={(e) => {
                        const value = e.target.value
                        setTasks(prev =>
                          prev.map((t, i) =>
                            i === actualIndex
                              ? { ...t, text: value }
                              : t
                          )
                        )
                      }}
                      className="
                        flex-1
                        h-7
                        px-2
                        bg-card
                        border border-border
                        shadow-none
                        focus-visible:ring-1
                        focus-visible:ring-ring
                        text-sm
                      "
                    />

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteTask(actualIndex)}
                      className="
                        h-7 px-2 shrink-0
                        text-muted-foreground
                        hover:text-destructive
                        hover:bg-destructive/10
                        border-border
                      "
                    >
                      Remove
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between pt-2 border-t border-border">
            <Button
              type="button"
              variant="destructive"
              onClick={handleDeleteCard}
            >
              Delete card
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button type="submit">
                Save changes
              </Button>
            </div>
          </div>

        </form>
      </DrawerContent>
    </Drawer>
  )
}