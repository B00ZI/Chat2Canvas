'use client'

import { useEffect, useState, useRef } from "react"
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
import {
  CheckSquare,
  Square,
  AlignLeft,
  Trash2,
  Plus,
  ListTodo,
} from "lucide-react"

interface Task {
  text: string
  done: boolean
}

interface Card {
  id: string
  title: string
  description?: string
  color: string
  isDone: boolean
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
  const editCard = useProjectStore((state) => state.editCard)
  const deleteCard = useProjectStore((state) => state.deleteCard)
  const toggleTask = useProjectStore((state) => state.toggleTask)
  const toggleCardIsDone = useProjectStore((state) => state.toggleCardIsDone)

  // Local View/Edit States
  const[isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(card.title)

  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [desc, setDesc] = useState(card.description || "")

  const [showColorOptions, setShowColorOptions] = useState(false)

  const [isAddingTask, setIsAddingTask] = useState(false)
  const[newTaskText, setNewTaskText] = useState("")
  const addTaskInputRef = useRef<HTMLInputElement>(null)

  const [editingTaskIdx, setEditingTaskIdx] = useState<number | null>(null)
  const[editTaskText, setEditTaskText] = useState("")

  // Reset UI states when opened/closed
  useEffect(() => {
    if (!open) {
      setIsEditingTitle(false)
      setIsEditingDesc(false)
      setIsAddingTask(false)
      setEditingTaskIdx(null)
      setShowColorOptions(false)
    } else {
      setTitle(card.title)
      setDesc(card.description || "")
    }
  }, [open, card.title, card.description])

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
    if (newTaskText.trim()) {
      // ✅ Adds the new task to the TOP of the list
      editCard(projectId, colId, card.id, {
        tasks:[{ text: newTaskText.trim(), done: false }, ...(card.tasks || [])],
      })
      setNewTaskText("")
      
      // Keep focus on the input so the user can add multiple tasks quickly
      requestAnimationFrame(() => addTaskInputRef.current?.focus())
    } else {
      setIsAddingTask(false)
    }
  }

  const handleEditTaskSave = (idx: number) => {
    if (editTaskText.trim()) {
      const newTasks =[...(card.tasks || [])]
      newTasks[idx].text = editTaskText.trim()
      editCard(projectId, colId, card.id, { tasks: newTasks })
    }
    setEditingTaskIdx(null)
  }

  const handleEditTaskCancel = () => {
    setEditingTaskIdx(null)
    setEditTaskText("")
  }

  // --- PROGRESS BAR CALCULATION ---
  const tasks = card.tasks ||[]
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.done).length
  const progress = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="mx-auto flex w-full max-w-2xl flex-col border-border bg-card text-card-foreground">
        
        {/* Hidden strictly for accessibility rules */}
        <DrawerHeader className="sr-only">
          <DrawerTitle>Card Details</DrawerTitle>
          <DrawerDescription>View and edit card details.</DrawerDescription>
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8">
          
          {/* 1. TOP HEADER (Title + Actions) */}
          <div className="flex items-start justify-between gap-6">
            
            {/* Title Section */}
            <div className="flex-1 -mt-1 group">
              {isEditingTitle ? (
                <Input
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleTitleSave()
                    if (e.key === "Escape") {
                      setTitle(card.title)
                      setIsEditingTitle(false)
                    }
                  }}
                  className="-ml-2 h-auto w-full bg-background px-2 py-1 text-[24px] font-bold tracking-tight shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                />
              ) : (
                <h2
                  onClick={() => setIsEditingTitle(true)}
                  className="-ml-2 cursor-text break-words rounded-md border border-transparent px-2 py-1 text-[24px] font-bold tracking-tight transition-colors hover:bg-muted/60"
                >
                  {card.title}
                </h2>
              )}
            </div>

            {/* Top Right Actions */}
            <div className="flex shrink-0 items-center gap-2">
              <Button
                variant={card.isDone ? "default" : "outline"}
                size="sm"
                onClick={() => toggleCardIsDone(projectId, colId, card.id)}
                className={`transition-all duration-300 ${
                  card.isDone
                    ? "border-transparent bg-green-600 text-white shadow-md hover:bg-green-700"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {card.isDone ? <CheckSquare className="mr-2 size-4" /> : <Square className="mr-2 size-4" />}
                {card.isDone ? "Completed" : "Mark as done"}
              </Button>

              <div className="relative">
                <button
                  onClick={() => setShowColorOptions(!showColorOptions)}
                  className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground shadow-sm"
                >
                  <span
                    className="size-3.5 rounded-full shadow-sm"
                    style={{ backgroundColor: card.color || "var(--color-primary)" }}
                  />
                  Color
                </button>

                {showColorOptions && (
                  <div className="absolute right-0 top-full z-50 mt-2 flex w-56 flex-wrap gap-2 rounded-xl border border-border bg-popover p-3 shadow-lg">
                    {COLUMN_COLORS.map((c) => (
                      <button
                        key={c.value}
                        title={c.name}
                        onClick={() => {
                          editCard(projectId, colId, card.id, { color: c.value })
                          setShowColorOptions(false)
                        }}
                        className="size-6 rounded-full border border-border/50 ring-offset-background transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1"
                        style={{ backgroundColor: c.value }}
                      />
                    ))}
                  </div>
                )}
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  deleteCard(projectId, colId, card.id)
                  onOpenChange(false)
                }}
                title="Delete Card"
              >
                <Trash2 className="size-4.5" />
              </Button>
            </div>
          </div>

          {/* 2. DESCRIPTION SECTION */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <AlignLeft className="size-5 text-muted-foreground" />
              <h3>Description</h3>
            </div>

            {isEditingDesc ? (
              <div className="mt-2 space-y-2">
                <textarea
                  autoFocus
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  placeholder="Add a more detailed description..."
                  className="min-h-[140px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      setDesc(card.description || "")
                      setIsEditingDesc(false)
                    }
                  }}
                />
                <div className="flex items-center gap-2">
                  <Button onClick={handleDescSave} size="sm">Save</Button>
                  {/* onMouseDown preventDefault stops the blur from misfiring */}
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
                className={`mt-2 min-h-[80px] cursor-pointer rounded-lg border border-transparent px-3 py-3 text-sm leading-relaxed transition-colors ${
                  card.description
                    ? "hover:bg-muted/60"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {card.description || "Add a more detailed description..."}
              </div>
            )}
          </div>

          {/* 3. TASKS SECTION */}
          <div className="space-y-4">
            
            {/* Header & Progress Bar */}
            <div>
              <div className="flex items-center gap-2 font-semibold text-foreground mb-3">
                <ListTodo className="size-5 text-muted-foreground" />
                <h3>Tasks</h3>
              </div>

              {totalTasks > 0 && (
                <div className="mb-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className={`h-full transition-all duration-500 ease-out ${
                        progress === 100 ? "bg-green-500" : "bg-primary"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Add Task Input/Button */}
            {isAddingTask ? (
              <div className="mb-4 space-y-3 rounded-lg border border-border bg-muted/20 p-3 shadow-sm">
                <Input
                  ref={addTaskInputRef}
                  autoFocus
                  placeholder="What needs to be done?"
                  value={newTaskText}
                  onChange={(e) => setNewTaskText(e.target.value)}
                  // If unfocused, hides the input and discards text
                  onBlur={() => {
                    setIsAddingTask(false)
                    setNewTaskText("")
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddTask()
                    if (e.key === "Escape") {
                      setIsAddingTask(false)
                      setNewTaskText("")
                    }
                  }}
                  className="bg-background focus-visible:ring-2 focus-visible:ring-primary"
                />
                <div className="flex items-center gap-2">
                  <Button 
                    onMouseDown={(e) => e.preventDefault()} // Prevents onBlur from firing first
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
                className="mb-4 w-full justify-start text-muted-foreground hover:bg-muted/60"
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

                // EDITED TASK VIEW
                if (isEditingThis) {
                  return (
                    <div key={index} className="flex items-start gap-3 rounded-lg border border-border bg-muted/20 p-3 shadow-sm transition-colors">
                      <button
                        onClick={() => toggleTask(projectId, colId, card.id, index)}
                        className="mt-2 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {task.done ? <CheckSquare className="size-5 text-green-500" /> : <Square className="size-5" />}
                      </button>

                      <div className="flex-1 space-y-2">
                        <Input
                          autoFocus
                          value={editTaskText}
                          onChange={(e) => setEditTaskText(e.target.value)}
                          onBlur={handleEditTaskCancel} // Cancels edit if user clicks away
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleEditTaskSave(index)
                            if (e.key === "Escape") handleEditTaskCancel()
                          }}
                          className="h-9 w-full bg-background shadow-sm focus-visible:ring-2 focus-visible:ring-primary"
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
                            onClick={handleEditTaskCancel}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )
                }

                // NORMAL TASK VIEW
                return (
                  <div key={index} className="group flex items-start gap-3 rounded-md px-1 py-1 hover:bg-muted/40 transition-colors">
                    
                    <button
                      onClick={() => toggleTask(projectId, colId, card.id, index)}
                      className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {task.done ? <CheckSquare className="size-5 text-green-500" /> : <Square className="size-5" />}
                    </button>

                    <span
                      onClick={() => {
                        setEditingTaskIdx(index)
                        setEditTaskText(task.text)
                      }}
                      className={`flex-1 cursor-text select-none break-words rounded-md border border-transparent px-1.5 py-0.5 -ml-1.5 text-[15px] transition-colors hover:bg-muted/80 ${
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
                      className="shrink-0 p-1 text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
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
      </DrawerContent>
    </Drawer>
  )
}