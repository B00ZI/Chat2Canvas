import { useRef } from "react"
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
interface NewProjectDialog {
    open: boolean
    onClose: () => void
}


export function NewProjectDialog({ open, onClose }: NewProjectDialog) {

    const inputRef = useRef<HTMLInputElement>(null)
    const addProject = useProjectStore((state) => state.addProject)
   

 function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); // Prevents the page from reloading
        let name = inputRef.current?.value;
        if (name && name.trim()) {
            addProject(name);
            onClose();
        }
    }

    return (

        <Dialog open={open} onOpenChange={onClose}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Project</DialogTitle>
                    <DialogDescription>
                        provide your
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                <Input   placeholder="e.g., My Awesome App"  type="text"  ref={inputRef}/>
                <Button type="submit">Create</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}