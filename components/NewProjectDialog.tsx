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
   


    function addNewProject() {
        let name = inputRef.current?.value
        if (name) {
            addProject(name)
        }
        onClose()
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

                <Input  type="text"  ref={inputRef}/>
                <Button onClick={addNewProject}>Create</Button>
            </DialogContent>
        </Dialog>
    )
}