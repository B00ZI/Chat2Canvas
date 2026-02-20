'use client'

import { useRef, useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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

interface EditCardDialogProps {
    open: boolean
    onClose: () => void
    projectId: string
    colId: string
    card: Card
}

export function EditCardDialog({
    open,
    onClose,
    projectId,
    colId,
    card,
}: EditCardDialogProps) {

    const [tasks, setTasks] = useState<Task[]>([])
    const [selectedColor, setSelectedColor] = useState(card.color)

    const titleInputRef = useRef<HTMLInputElement>(null)
    const taskInputRef = useRef<HTMLInputElement>(null)

    const editCard = useProjectStore((state) => state.editCard)

    useEffect(() => {
        if (open) {
            setTasks(card.tasks)
            setSelectedColor(card.color)
        }
    }, [card.id, open])

    function handleAddTask() {
        const taskText = taskInputRef.current?.value.trim()

        if (taskText && taskInputRef.current) {
            const newTask = { text: taskText, done: false }
            setTasks((prev) => [...prev, newTask])
            taskInputRef.current.value = ""
        }
    }

    function handleDeleteTask(taskIndex: number) {
        setTasks((prev) => prev.filter((_, index) => index !== taskIndex))
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        const title = titleInputRef.current?.value.trim()

        if (!title || !selectedColor) return

        editCard(projectId, colId, card.id, {
            title,
            color: selectedColor,
            tasks,
        })

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
                        Edit card
                    </DialogTitle>
                    <DialogDescription className="text-sm text-muted-foreground">
                        Update card details and tasks.
                    </DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-6"
                >
                    {/* Main fields */}
                    <div className="space-y-5">

                        {/* Title */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-sm font-medium text-foreground">
                                Card title
                            </label>

                            <Input
                                ref={titleInputRef}
                                defaultValue={card.title}
                                autoFocus
                                className="
                  bg-background
                  focus-visible:ring-1
                  focus-visible:ring-ring
                "
                            />
                        </div>

                        {/* Color picker (same as column) */}
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-foreground">
                                Card color
                            </label>

                            <div className="grid grid-cols-6 gap-1.5">
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
                                    onKeyDown={(e) =>
                                        e.key === "Enter" && (e.preventDefault(), handleAddTask())
                                    }
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
                                    Add Task
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
          bg-card
          px-3 py-2
        "
                                        >
                                            <Input
                                                value={task.text}
                                                onChange={(e) => {
                                                    setTasks(prev =>
                                                        prev.map((t, i) =>
                                                            i === actualIndex
                                                                ? { ...t, text: e.target.value }
                                                                : t
                                                        )
                                                    )
                                                }}
                                                className="
            flex-1
            h-7
            px-2
            bg-background
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
    h-7
    px-2
    shrink-0
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
                    </div>

                    {/* Footer */}
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
