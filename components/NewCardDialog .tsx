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
interface NewCardDialog {
    open: boolean
    onClose: () => void,
    projectId: string,
    colId: string
}

interface Task {
    text: string;
    done: boolean;
}


export function NewCardDialog({ open, onClose, projectId, colId }: NewCardDialog) {

    const [tasks, setTasks] = useState<Task[]>([])

    const titleInputRef = useRef<HTMLInputElement>(null)
    const colorInputRef = useRef<HTMLInputElement>(null)
    const taskInputRef = useRef<HTMLInputElement>(null)
    const addCard = useProjectStore((state) => state.addCard)

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
            addCard(projectId, colId, { title, color, tasks });
            onClose()
           setTasks([])
        }
    }

    return (

        <Dialog open={open} onOpenChange={onClose}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Card</DialogTitle>
                    <DialogDescription>
                        set the Card Title and color and tasks
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-4">

                        <label className="text-sm font-medium  ">Card Title</label>
                        <Input placeholder="e.g., Frontend" type="text" ref={titleInputRef} />

                        <label className="text-sm font-medium  ">Card Color</label>
                        <Input type="color" ref={colorInputRef} />

                        <label className="text-sm font-medium  ">Card Tasks</label>
                        <div className="flex gap-3">

                            <Input className="flex-3" type="text" ref={taskInputRef} />

                            <button onClick={handleAddTask} type="button" className="w-full  flex flex-1 items-center justify-center gap-2 cursor-pointer border  border-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:border-gray-300! hover:text-gray-700">
                                <span className="text-lg">+</span>
                                Add
                            </button>
                        </div>
                        <div className="flex flex-col gap-2 overflow-y-auto max-h-70 ">
                            {tasks.map((task, taskIndex) =>

                                <div key={`${task.text}-${taskIndex}`} className="w-full flex  cursor-pointer border  py-2 px-3 border-gray-200 rounded-lg text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:border-gray-300! hover:text-gray-700">

                                    <div className="flex-4">
                                        {task.text}

                                    </div>
                                    <button onClick={() => handleDeleteTask(taskIndex)} type="button" className="w-full flex-1  cursor-pointer border  border-red-200 rounded-lg text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:border-red-300! hover:text-red-700">

                                        delete
                                    </button>
                                </div>

                            )}


                        </div>

                    </div>
                    <Button type="submit">Create</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}