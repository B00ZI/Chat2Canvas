'use client'

import { useState, useRef, useEffect } from "react"
import { useProjectStore } from "@/store/projectStore"
import { COLUMN_COLORS } from "@/lib/column-colors"
import { Card } from "@/lib/types"

import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Check,
  CheckSquare,
  Square,
  AlignLeft,
  Trash2,
  Plus,
  ListTodo,
} from "lucide-react"
import { toast } from "sonner"

interface CardDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  colId: string
  card: Card
}

/** Body shared by the desktop side panel and the mobile bottom drawer. */
function CardDetailsBody({
  projectId,
  colId,
  card,
  onClose,
}: Pick<CardDetailsProps, "projectId" | "colId" | "card"> & { onClose: () => void }) {
  const editCard = useProjectStore((state) => state.editCard)
  const deleteCard = useProjectStore((state) => state.deleteCard)
  const toggleTask = useProjectStore((state) => state.toggleTask)
  const toggleCardIsDone = useProjectStore((state) => state.toggleCardIsDone)

  // Local View/Edit States
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(() => card.title)

  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [desc, setDesc] = useState(() => card.description || "")

  const [showColorOptions, setShowColorOptions] = useState(false)

  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskText, setNewTaskText] = useState("")
  const addTaskInputRef = useRef<HTMLInputElement>(null)

  const [editingTaskIdx, setEditingTaskIdx] = useState<number | null>(null)
  const [editTaskText, setEditTaskText] = useState("")

  // --- ACTIONS ---

  const handleTitleSave = () => {
    if (title.trim() && title.trim() !== card.title) {
      editCard(projectId, colId, card.id, { title: title.trim() })
    } else {
      setTitle(card.title) // Revert if empty
    }
    setIsEditingTitle(false)
  }

  const handleDescSave = () => {
    editCard(projectId, colId, card.id, { description: desc.trim() })
    setIsEditingDesc(false)
  }

  const handleAddTask = () => {
    if (!newTaskText.trim()) {
      addTaskInputRef.current?.focus()
      return
    }

    // Add new task to the TOP of the list
    editCard(projectId, colId, card.id, {
      tasks: [{ text: newTaskText.trim(), done: false }, ...(card.tasks || [])],
    })

    setNewTaskText("")
    // Keep focus so user can rapidly add multiple tasks
    requestAnimationFrame(() => addTaskInputRef.current?.focus())
  }

  const handleEditTaskSave = (idx: number) => {
    if (!editTaskText.trim()) {
      setEditingTaskIdx(null)
      setEditTaskText("")
      return
    }
    const newTasks = [...(card.tasks || [])]
    newTasks[idx].text = editTaskText.trim()
    editCard(projectId, colId, card.id, { tasks: newTasks })
    setEditingTaskIdx(null)
  }

  // --- PROGRESS BAR CALCULATION ---
  const tasks = card.tasks || []
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.done).length
  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <div className="scrollbar-slim flex-1 space-y-8 overflow-y-auto p-6 md:p-8">
      {/* 1. TOP HEADER (Checkbox + Title + Actions) */}
      <div className="flex items-start justify-between gap-4">
        {/* Left Side: Checkbox & Title */}
        <div className="flex flex-1 items-start gap-3">
          {/* Circular "Mark as Done" Button — done styling is applied
              conditionally so hover can never mask the completed state */}
          <button
            onClick={() => toggleCardIsDone(projectId, colId, card.id)}
            aria-label={card.isDone ? "Mark as undone" : "Mark as done"}
            data-done={card.isDone}
            className={`after:absolute after:-inset-1 after:rounded-full after:content-['']
              relative mt-2 flex size-7 shrink-0 items-center justify-center
              rounded-full border-2 transition-all duration-150 active:scale-90 ${
                card.isDone
                  ? "border-success bg-success"
                  : "border-border-strong hover:border-success hover:bg-success/10"
              }`}
          >
            {card.isDone && (
              <Check className="check-pop text-background size-4 stroke-[3]" />
            )}
          </button>

          {/* Title Section */}
          <div className="group flex-1">
            {isEditingTitle ? (
              <textarea
                autoFocus
                value={title}
                rows={1}
                onChange={(e) => setTitle(e.target.value)}
                // Auto-resize while typing
                onInput={(e) => {
                  e.currentTarget.style.height = "auto"
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`
                }}
                onFocus={(e) => {
                  e.target.style.height = "auto"
                  e.target.style.height = `${e.target.scrollHeight}px`
                }}
                onBlur={handleTitleSave}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleTitleSave()
                  }
                  if (e.key === "Escape") {
                    setTitle(card.title)
                    setIsEditingTitle(false)
                  }
                }}
                className="h-auto w-full resize-none overflow-hidden break-words rounded-md px-2 py-1 text-2xl font-bold tracking-tight focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                className={`wrap-break-word mb-[7px] cursor-text rounded-md px-2 py-1 text-2xl font-bold tracking-tight transition-colors ${
                  card.isDone
                    ? "text-muted-foreground line-through"
                    : "text-foreground"
                }`}
              >
                {card.title}
              </h2>
            )}
          </div>
        </div>

        {/* Right Side: Actions (color + delete) */}
        <div className="flex shrink-0 items-center gap-1.5 pt-1.5">
          {/* Color picker */}
          <div className="relative">
            <button
              onClick={() => setShowColorOptions(!showColorOptions)}
              className="focus-visible:ring-ring shadow-sm hover:border-border-strong flex h-7 w-12 rounded-md border-2 border-border transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
              style={{ backgroundColor: card.color || "var(--color-primary)" }}
              aria-label="Change card color"
            />

            {showColorOptions && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowColorOptions(false)}
                />
                <div className="bg-popover absolute top-full right-0 z-50 mt-2 flex w-56 flex-wrap gap-2 rounded-xl border border-border p-3 shadow-lg">
                  {COLUMN_COLORS.map((c) => (
                    <button
                      key={c.value}
                      title={c.name}
                      onClick={() => {
                        editCard(projectId, colId, card.id, { color: c.value })
                        setShowColorOptions(false)
                      }}
                      className="focus-visible:ring-ring ring-offset-background size-6 rounded-full border border-border/50 transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Delete */}
          <Button
            variant="ghost"
            size="icon-sm"
            className="bg-muted text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
            onClick={() => {
              deleteCard(projectId, colId, card.id)
              onClose()
              toast.success("Card deleted")
            }}
            title="Delete Card"
          >
            <Trash2 className="size-4" />
          </Button>
        </div>
      </div>

      {/* 2. DESCRIPTION */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <AlignLeft className="text-muted-foreground size-5" />
          <h3>Description</h3>
        </div>

        {isEditingDesc ? (
          <div className="mt-2 space-y-2">
            <textarea
              autoFocus
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Add a more detailed description..."
              className="placeholder:text-muted-foreground focus-visible:ring-ring min-h-[140px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:ring-2 focus-visible:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  setDesc(card.description || "")
                  setIsEditingDesc(false)
                }
              }}
            />
            <div className="flex items-center gap-2">
              <Button onClick={handleDescSave} size="sm">
                Save
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setDesc(card.description || "")
                  setIsEditingDesc(false)
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => setIsEditingDesc(true)}
            className={`mt-2 min-h-[80px] cursor-pointer rounded-lg px-3 py-3 text-sm leading-relaxed transition-colors ${
              card.description
                ? "border border-transparent hover:bg-muted/60"
                : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
            }`}
          >
            {card.description || "Add a more detailed description..."}
          </div>
        )}
      </div>

      {/* 3. TASKS */}
      <div className="space-y-4">
        <div>
          <div className="mb-3 flex items-center gap-2 font-semibold text-foreground">
            <ListTodo className="text-muted-foreground size-5" />
            <h3>Tasks</h3>
          </div>

          {totalTasks > 0 && (
            <div className="mb-4 space-y-1.5">
              <div className="text-muted-foreground flex items-center justify-between text-xs font-medium">
                <span>Progress</span>
                <span className="tabular-nums">{progress}%</span>
              </div>
              <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    progress === 100 ? "bg-success" : "bg-primary"
                  }`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Add Task */}
        {isAddingTask ? (
          <div
            onBlur={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget)) {
                setIsAddingTask(false)
                setNewTaskText("")
              }
            }}
            className="bg-muted/20 mb-4 space-y-3 rounded-lg border border-border p-3 shadow-sm"
          >
            <Input
              ref={addTaskInputRef}
              autoFocus
              placeholder="What needs to be done?"
              value={newTaskText}
              onChange={(e) => setNewTaskText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleAddTask()
                }
                if (e.key === "Escape") {
                  setIsAddingTask(false)
                  setNewTaskText("")
                }
              }}
              className="bg-background focus-visible:ring-ring focus-visible:ring-2"
            />
            <div className="flex items-center gap-2">
              <Button
                onMouseDown={(e) => e.preventDefault()}
                onClick={handleAddTask}
                size="sm"
              >
                Add
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setIsAddingTask(false)
                  setNewTaskText("")
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <Button
            variant="ghost"
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground mb-4 w-full justify-start"
            onClick={() => {
              setIsAddingTask(true)
              setNewTaskText("")
            }}
          >
            <Plus className="mr-2 size-4" />
            Add task
          </Button>
        )}

        {/* Task List */}
        <div className="space-y-1.5">
          {tasks.map((task, index) => {
            const isEditingThis = editingTaskIdx === index

            if (isEditingThis) {
              return (
                <div
                  key={index}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setEditingTaskIdx(null)
                      setEditTaskText("")
                    }
                  }}
                  className="bg-muted/20 flex items-start gap-3 rounded-lg border border-border p-3 shadow-sm transition-colors"
                >
                  <button
                    onClick={() =>
                      toggleTask(projectId, colId, card.id, index)
                    }
                    className="text-muted-foreground mt-2 shrink-0 transition-colors hover:text-foreground"
                    aria-label={task.done ? "Mark task as not done" : "Mark task as done"}
                  >
                    {task.done ? (
                      <CheckSquare className="text-success size-5" />
                    ) : (
                      <Square className="size-5" />
                    )}
                  </button>

                  <div className="flex-1 space-y-3">
                    <Input
                      autoFocus
                      value={editTaskText}
                      onChange={(e) => setEditTaskText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleEditTaskSave(index)
                        if (e.key === "Escape") {
                          setEditingTaskIdx(null)
                          setEditTaskText("")
                        }
                      }}
                      className="focus-visible:ring-ring h-9 w-full bg-background shadow-sm focus-visible:ring-2"
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => handleEditTaskSave(index)}
                      >
                        Update
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setEditingTaskIdx(null)
                          setEditTaskText("")
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )
            }

            return (
              <div
                key={index}
                className="group hover:bg-muted flex items-start gap-3 rounded-md px-1 py-1 transition-colors"
              >
                <button
                  onClick={() => toggleTask(projectId, colId, card.id, index)}
                  className="text-muted-foreground mt-0.5 shrink-0 transition-colors hover:text-foreground"
                  aria-label={task.done ? "Mark task as not done" : "Mark task as done"}
                >
                  {task.done ? (
                    <CheckSquare className="text-success size-5" />
                  ) : (
                    <Square className="size-5" />
                  )}
                </button>

                <span
                  onClick={() => {
                    setEditingTaskIdx(index)
                    setEditTaskText(task.text)
                  }}
                  className={`-ml-1.5 flex-1 cursor-text break-words rounded-md px-1.5 py-0.5 text-[15px] select-none transition-colors ${
                    task.done
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  }`}
                >
                  {task.text}
                </span>

                <button
                  onClick={() => {
                    const newTasks = [...tasks]
                    newTasks.splice(index, 1)
                    editCard(projectId, colId, card.id, { tasks: newTasks })
                  }}
                  className="text-muted-foreground hover:text-destructive shrink-0 p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  title="Remove task"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function CardDetailsDrawer({
  open,
  onOpenChange,
  projectId,
  colId,
  card,
}: CardDetailsProps) {
  // Side panel from md up; bottom sheet below that.
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const update = () => setIsDesktop(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  if (isDesktop) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent
          side="right"
          showClose={false}
          className="w-[520px] gap-0 p-0 sm:max-w-[520px]"
        >
          <SheetTitle className="sr-only">Card details</SheetTitle>
          <SheetDescription className="sr-only">
            View and edit card details.
          </SheetDescription>

          <CardDetailsBody
            projectId={projectId}
            colId={colId}
            card={card}
            onClose={() => onOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto flex max-h-[92vh] w-full max-w-2xl flex-col border-border bg-card text-card-foreground">
        <DrawerHeader className="sr-only">
          <DrawerTitle>Card Details</DrawerTitle>
          <DrawerDescription>View and edit card details.</DrawerDescription>
        </DrawerHeader>

        <CardDetailsBody
          projectId={projectId}
          colId={colId}
          card={card}
          onClose={() => onOpenChange(false)}
        />
      </DrawerContent>
    </Drawer>
  )
}
