'use client'

import { useState, useRef, useEffect } from "react"
import { useProjectStore } from "@/store/projectStore"
import { COLUMN_COLORS } from "@/lib/column-colors"
import {
  Check,
  CheckSquare,
  Square,
  AlignLeft,
  Trash2,
  Plus,
  ListTodo,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"

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
import { TagPill } from "@/components/TagPill"
import type { Card } from "@/lib/types"

interface CardDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  projectId: string
  colId: string
  card: Card
}

/** ── Tags section ────────────────────────────────────────────────────── */
function TagsSection({
  projectId,
  colId,
  card,
}: Pick<CardDetailsProps, "projectId" | "colId" | "card">) {
  const addTag = useProjectStore((s) => s.addTag)
  const removeTag = useProjectStore((s) => s.removeTag)

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState("")
  const [color, setColor] = useState<string>(COLUMN_COLORS[4].value)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (adding) inputRef.current?.focus()
  }, [adding])

  function reset() {
    setAdding(false)
    setName("")
    setColor(COLUMN_COLORS[4].value)
  }

  function commit() {
    const trimmed = name.trim()
    if (!trimmed) {
      reset()
      return
    }
    addTag(projectId, colId, card.id, { name: trimmed.slice(0, 12), color })
    reset()
  }

  // Blur lives on the whole editor box: clicking a swatch or button keeps
  // us inside, clicking truly away commits — fixes "always saves blue".
  function handleBoxBlur(e: React.FocusEvent<HTMLDivElement>) {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) commit()
  }

  return (
    <div className="space-y-2.5">
      <span className="text-muted-foreground block text-[10px] font-semibold tracking-widest uppercase">
        Tags {(card.tags?.length ?? 0) > 0 && `· ${card.tags!.length}/4`}
      </span>

      <div className="flex flex-wrap items-center gap-1.5">
        {(card.tags ?? []).map((tag, i) => (
          <TagPill
            key={`${tag.name}-${i}`}
            name={tag.name}
            color={tag.color}
            onRemove={() => removeTag(projectId, colId, card.id, i)}
          />
        ))}

        {!adding && (card.tags?.length ?? 0) < 4 && (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="text-muted-foreground hover:border-primary/50 hover:text-primary flex cursor-pointer items-center gap-1 rounded-full border border-dashed border-border px-3 py-1.5 text-xs font-medium transition-colors"
          >
            <Plus className="size-3.5" />
            Add tag
          </button>
        )}
      </div>

      {adding && (
        /* Comfortable editor box — commits on Enter or click-away */
        <div
          onBlur={handleBoxBlur}
          className="bg-muted/20 space-y-3 rounded-xl border border-border p-3.5"
        >
          <Input
            ref={inputRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit()
              if (e.key === "Escape") reset()
            }}
            placeholder="Tag name…"
            maxLength={12}
            className="h-9 bg-background text-sm"
          />

          {/* Swatches get their own full-width row */}
          <div className="flex flex-wrap items-center gap-2">
            {COLUMN_COLORS.map((c) => (
              <button
                key={c.value}
                type="button"
                aria-label={`Tag color ${c.name}`}
                onClick={() => setColor(c.value)}
                className={`size-6 cursor-pointer rounded-full transition-transform hover:scale-110 ${
                  color === c.value
                    ? "ring-ring ring-2 ring-offset-2 ring-offset-card"
                    : ""
                }`}
                style={{ backgroundColor: c.value }}
              />
            ))}
          </div>

          {/* Actions pinned under the swatches — never pushed off-canvas */}
          <div className="flex items-center justify-end gap-1.5">
            <Button variant="ghost" size="sm" onClick={reset}>
              Cancel
            </Button>
            <Button size="sm" className="min-w-20 px-4" onClick={commit}>
              Add tag
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

/** ── Body shared by the desktop panel and the mobile sheet ───────────── */
function CardDetailsBody({
  projectId,
  colId,
  card,
  onClose,
}: Pick<CardDetailsProps, "projectId" | "colId" | "card"> & {
  onClose: () => void
}) {
  const editCard = useProjectStore((state) => state.editCard)
  const deleteCard = useProjectStore((state) => state.deleteCard)
  const toggleTask = useProjectStore((state) => state.toggleTask)
  const toggleCardIsDone = useProjectStore((state) => state.toggleCardIsDone)

  // Local View/Edit States
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [title, setTitle] = useState(() => card.title)

  const [isEditingDesc, setIsEditingDesc] = useState(false)
  const [desc, setDesc] = useState(() => card.description || "")

  const [isAddingTask, setIsAddingTask] = useState(false)
  const [newTaskText, setNewTaskText] = useState("")
  const addTaskInputRef = useRef<HTMLInputElement>(null)

  // Only ONE task may be in edit mode; null = none.
  const [editingTaskIdx, setEditingTaskIdx] = useState<number | null>(null)
  const [editTaskText, setEditTaskText] = useState("")

  function handleDelete() {
    deleteCard(projectId, colId, card.id)
    onClose()
    toast.success("Card deleted")
  }

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

  /** Inline task editor commits on Enter OR blur — no stuck states. */
  const beginEditTask = (idx: number) => {
    setEditingTaskIdx(idx)
    setEditTaskText(card.tasks?.[idx]?.text ?? "")
  }
  const commitEditTask = () => {
    if (editingTaskIdx === null) return
    const idx = editingTaskIdx
    const trimmed = editTaskText.trim()
    if (trimmed && trimmed !== card.tasks?.[idx]?.text) {
      const newTasks = [...(card.tasks || [])]
      newTasks[idx] = { ...newTasks[idx], text: trimmed }
      editCard(projectId, colId, card.id, { tasks: newTasks })
    }
    setEditingTaskIdx(null)
    setEditTaskText("")
  }
  const cancelEditTask = () => {
    setEditingTaskIdx(null)
    setEditTaskText("")
  }

  // --- PROGRESS ---
  const tasks = card.tasks || []
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.done).length
  const progress =
    totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100)

  return (
    <>
      {/* Scrollable content */}
      <div className="scrollbar-slim min-h-0 flex-1 space-y-8 overflow-y-auto p-7">
        {/* ── 1. HERO TITLE ───────────────────────────────────────────── */}
        <div className="flex items-start gap-3.5 pt-1">
          {/* Circular "Mark as Done" Button */}
          <button
            onClick={() => toggleCardIsDone(projectId, colId, card.id)}
            aria-label={card.isDone ? "Mark as undone" : "Mark as done"}
            data-done={card.isDone}
            className={`after:absolute after:-inset-1 after:rounded-full after:content-['']
              relative mt-2.5 flex size-7 shrink-0 cursor-pointer items-center justify-center
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

          {/* Title — the biggest element in the drawer */}
          <div className="min-w-0 flex-1">
            {isEditingTitle ? (
              <textarea
                autoFocus
                value={title}
                rows={1}
                onChange={(e) => setTitle(e.target.value)}
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
                className="h-auto w-full resize-none overflow-hidden break-words rounded-md px-2 py-1 text-3xl leading-tight font-bold tracking-tight focus-visible:ring-primary/60 focus-visible:ring-2 focus-visible:outline-none"
              />
            ) : (
              <h2
                onClick={() => setIsEditingTitle(true)}
                title="Click to rename"
                className={`wrap-break-word -mx-2 cursor-text rounded-md px-2 py-1 text-3xl leading-tight font-bold tracking-tight transition-colors ${
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

        {/* ── 2. TAGS ──────────────────────────────────────────────────── */}
        <TagsSection projectId={projectId} colId={colId} card={card} />

        {/* ── 3. DESCRIPTION ───────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlignLeft className="text-muted-foreground size-4" />
            <h3 className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
              Description
            </h3>
          </div>

          {isEditingDesc ? (
            <div className="space-y-2">
              <textarea
                autoFocus
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                placeholder="Add a more detailed description..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault()
                    handleDescSave()
                  }
                  if (e.key === "Escape") {
                    setDesc(card.description || "")
                    setIsEditingDesc(false)
                  }
                }}
                className="placeholder:text-muted-foreground/70 focus-visible:ring-ring min-h-[120px] w-full resize-none rounded-lg border border-input bg-background px-3 py-2.5 text-sm leading-relaxed shadow-sm focus-visible:ring-2 focus-visible:outline-none"
              />
              <p className="text-muted-foreground/60 text-[10px]">
                ⌘↵ to save · Esc to cancel
              </p>
            </div>
          ) : (
            <div
              onClick={() => setIsEditingDesc(true)}
              className={`cursor-text rounded-lg text-sm leading-relaxed transition-colors ${
                card.description
                  ? "-mx-2 border border-transparent px-2 py-1.5 hover:bg-muted/60"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/60 px-3 py-3"
              }`}
            >
              {card.description || "Add a more detailed description..."}
            </div>
          )}
        </div>

        {/* ── 4. TASKS ─────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="text-muted-foreground size-4" />
              <h3 className="text-muted-foreground text-[10px] font-semibold tracking-widest uppercase">
                Tasks
              </h3>
            </div>

            {totalTasks > 0 && (
              <span
                className={`text-xs font-medium tabular-nums ${
                  progress === 100 ? "text-success" : "text-muted-foreground"
                }`}
              >
                {completedTasks}/{totalTasks}
              </span>
            )}
          </div>

          {totalTasks > 0 && (
            <div className="bg-secondary h-1.5 w-full overflow-hidden rounded-full">
              <div
                className={`h-full transition-all duration-500 ease-out ${
                  progress === 100 ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Add task */}
          {isAddingTask ? (
            <div
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget)) {
                  setIsAddingTask(false)
                  setNewTaskText("")
                }
              }}
              className="bg-muted/20 space-y-2.5 rounded-xl border border-border p-3.5"
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
                className="h-9 bg-background focus-visible:ring-ring focus-visible:ring-2"
              />
              <p className="text-muted-foreground/60 text-[10px]">
                ↵ to add · keeps focus for rapid entry · Esc to close
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setIsAddingTask(true)
                setNewTaskText("")
              }}
              className="text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-sm font-medium transition-colors"
            >
              <Plus className="size-4" />
              Add task
            </button>
          )}

          {/* Task list */}
          <div className="space-y-1">
            {tasks.map((task, index) => {
              const isEditingThis = editingTaskIdx === index

              // ── EDIT MODE: bare input, commits on Enter/blur, Esc reverts
              if (isEditingThis) {
                return (
                  <div key={index} className="-mx-1.5">
                    <Input
                      autoFocus
                      value={editTaskText}
                      onChange={(e) => setEditTaskText(e.target.value)}
                      onBlur={commitEditTask}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitEditTask()
                        if (e.key === "Escape") cancelEditTask()
                      }}
                      className="focus-visible:ring-ring h-9 bg-background text-sm shadow-sm focus-visible:ring-2"
                    />
                    <p className="text-muted-foreground/60 mt-1 pl-1 text-[10px]">
                      ↵ to save · Esc to cancel
                    </p>
                  </div>
                )
              }

              // ── NORMAL ROW: click anywhere toggles; pencil edits
              return (
                <div
                  key={index}
                  className="group/task hover:bg-muted -mx-2 flex items-start gap-3 rounded-lg px-2 py-2 transition-colors"
                >
                  <button
                    onClick={() => toggleTask(projectId, colId, card.id, index)}
                    className="text-muted-foreground mt-0.5 shrink-0 transition-colors hover:text-foreground"
                    aria-label={
                      task.done ? "Mark task as not done" : "Mark task as done"
                    }
                  >
                    {task.done ? (
                      <CheckSquare className="text-success size-[18px]" />
                    ) : (
                      <Square className="size-[18px]" />
                    )}
                  </button>

                  <span
                    onClick={() => toggleTask(projectId, colId, card.id, index)}
                    className={`flex-1 cursor-pointer break-words py-0.5 text-sm leading-relaxed select-none transition-colors ${
                      task.done
                        ? "text-muted-foreground decoration-border-strong line-through"
                        : "text-foreground"
                    }`}
                  >
                    {task.text}
                  </span>

                  <span className="flex shrink-0 items-center gap-0.5 pt-0.5 opacity-0 transition-opacity group-hover/task:opacity-100 focus-within:opacity-100">
                    <button
                      onClick={() => beginEditTask(index)}
                      aria-label="Edit task"
                      className="text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer rounded-md p-1.5 transition-colors"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      onClick={() =>
                        editCard(projectId, colId, card.id, {
                          tasks: tasks.filter((_, i) => i !== index),
                        })
                      }
                      aria-label="Remove task"
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/15 cursor-pointer rounded-md p-1.5 transition-colors"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                </div>
              )
            })}

            {totalTasks === 0 && (
              <p className="text-muted-foreground/60 py-1 text-sm">
                No subtasks yet — break this card down into steps.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fixed footer: delete + big close */}
      <div className="flex shrink-0 items-center gap-2 border-t border-border bg-card px-6 py-4">
        <Button
          variant="ghost"
          onClick={handleDelete}
          className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-10 shrink-0 gap-2 transition-colors"
        >
          <Trash2 className="size-4" />
          Delete
        </Button>

        <Button onClick={onClose} className="h-10 flex-1">
          Close
        </Button>
      </div>
    </>
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

  const close = () => onOpenChange(false)

  if (isDesktop) {
    return (
      /* Non-modal: background stays interactive. Clicking another card
         swaps content; clicking EMPTY board space closes the drawer. */
      <Sheet open={open} onOpenChange={onOpenChange} modal={false}>
        <SheetContent
          side="right"
          showClose={false}
          showOverlay={false}
          onPointerDownOutside={(e) => {
            // Swallow dismisses that land on cards/columns (that click is a
            // swap-in-place); let empty-space clicks close the drawer.
            const target = e.detail.originalEvent.target as HTMLElement | null
            if (target?.closest("[data-board-item]")) e.preventDefault()
          }}
          onFocusOutside={(e) => e.preventDefault()}
          className="
            top-4 right-4 bottom-4 h-auto w-[520px] max-w-[calc(100vw-2rem)]
            gap-0 overflow-hidden rounded-2xl border border-border p-0 shadow-xl
          "
        >
          <SheetTitle className="sr-only">{card.title}</SheetTitle>
          <SheetDescription className="sr-only">
            View and edit card details.
          </SheetDescription>

          {/* key resets local edit state when swapping between cards */}
          <CardDetailsBody
            key={card.id}
            projectId={projectId}
            colId={colId}
            card={card}
            onClose={close}
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
          key={card.id}
          projectId={projectId}
          colId={colId}
          card={card}
          onClose={close}
        />
      </DrawerContent>
    </Drawer>
  )
}
