'use-client'
import { useRef } from "react"
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
import {
    Dialog,
    DialogContent,

    DialogHeader,
    DialogTitle,

} from "@/components/ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { useProjectStore } from "@/store/projectStore"
interface EditProjectDialog {
    open: boolean
    onClose: () => void,
    projectName: string,
    projectId: string,
}


export function EditProjectDialog({ open, onClose, projectName, projectId }: EditProjectDialog) {

    const inputRef = useRef<HTMLInputElement>(null)
    const editProject = useProjectStore((state) => state.editProject)
    const deleteProject = useProjectStore((state) => state.deleteProject)


    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        let name = inputRef.current?.value;
        if (name && name.trim()) {
            editProject(projectId, name);
            onClose();
        }
    }
    function handleDelete() {
        deleteProject(projectId)
        onClose()
    }

    return (

        <Dialog open={open} onOpenChange={onClose}>

            <DialogContent >
                <DialogHeader>
                    <DialogTitle>Edit your Project Name</DialogTitle>

                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    <Input type="text" ref={inputRef} defaultValue={projectName} />
                    <Button className="mr-2.5" type="submit">Save</Button>

                  

                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                              <Button variant="destructive" type="button"  >delete</Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete your
                                    project
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete}>Continue</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </form>
            </DialogContent>
        </Dialog>
    )
}