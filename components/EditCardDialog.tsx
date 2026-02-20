import { useRef, useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog"

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
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useProjectStore } from "@/store/projectStore"


interface Task {
    text: string;
    done: boolean;
}

interface Card {
    id: string;
    number: number;
    title: string;
    color: string;
    tasks: Task[];
}

interface EditCardDialog {
    open: boolean
    onClose: () => void,
    projectId: string,
    colId: string,
    card: Card
}



export function EditCardDialog({ open, onClose, projectId, colId, card }: EditCardDialog) {

    const [tasks, setTasks] = useState<Task[]>([])

    const titleInputRef = useRef<HTMLInputElement>(null)
    const colorInputRef = useRef<HTMLInputElement>(null)
    const taskInputRef = useRef<HTMLInputElement>(null)
    const editCard = useProjectStore((state) => state.editCard)


    useEffect(() => {
        if (open) {
            setTasks(card.tasks)
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
        e.preventDefault(); // Prevents the page from reloading
        let title = titleInputRef.current?.value.trim();
        let color = colorInputRef.current?.value.trim();
        if (title && color) {
            editCard(projectId, colId, card.id, { title, color, tasks });
            onClose()

        }
    }



    return (

        <Dialog open={open} onOpenChange={onClose}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Card</DialogTitle>
                    <DialogDescription>
                        You can edit the Card Title and color and tasks
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">

                        <label className="text-sm font-medium  ">Card Title</label>
                        <Input placeholder="e.g., Frontend" type="text" ref={titleInputRef} defaultValue={card.title} />

                        <label className="text-sm font-medium  ">Card Color</label>
                        <Input type="color" ref={colorInputRef} defaultValue={card.color} />

                        <label className="text-sm font-medium  ">Card Tasks</label>
                        <div className="flex gap-3">

                            <Input onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTask())} className="flex-3" type="text" ref={taskInputRef} />

                            <button onClick={handleAddTask} type="button" className="w-full  flex flex-1 items-center justify-center gap-2 cursor-pointer border  border-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:border-gray-300! hover:text-gray-700">
                                <span className="text-lg">+</span>
                                Add
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-70">
                            {[...tasks].reverse().map((task, reversedIndex) => {
                                const actualIndex = tasks.length - 1 - reversedIndex;
                                return (

                                    <div key={actualIndex} className="flex gap-2 items-center border p-2 rounded-lg bg-white group">

                                        <Input
                                            value={task.text}
                                            onChange={(e) => {
                                                setTasks(prev => prev.map((task, i) =>
                                                    i === actualIndex ? { ...task, text: e.target.value } : task
                                                ));
                                            }}
                                            className="flex-1 border-none bg-transparent focus-visible:ring-0 shadow-none p-0 h-auto font-medium text-gray-600"
                                        />

                                        <button
                                            onClick={() => handleDeleteTask(actualIndex)}
                                            type="button"
                                            className="opacity-0 group-hover:opacity-100 text-xs text-red-500 hover:text-red-700 transition-all p-1"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                )


                            }


                            )}
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