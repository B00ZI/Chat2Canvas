import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,

} from "@/components/ui/alert-dialog"
import { useProjectStore } from "@/store/projectStore"

interface DeleteProjectDialog {
    open: boolean
    onClose: () => void
    projectName: string
    projectId: string
}

export function DeleteProjecDIalog({ open, onClose, projectName, projectId }: DeleteProjectDialog) {
    const deleteProject = useProjectStore((state) => state.deleteProject)

    function handleDelete() {
        deleteProject(projectId)
        onClose()
    }
    return (
        <AlertDialog open={open} onOpenChange={onClose}>
            <AlertDialogContent
                className="
                bg-card text-card-foreground
                border border-border
                shadow-lg
                rounded-lg
              "
            >
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Delete "{projectName}"?
                    </AlertDialogTitle>

                    <AlertDialogDescription className="text-muted-foreground">
                        This action cannot be undone. This will permanently delete your project.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>

                    <AlertDialogAction
                        variant={'destructive'}
                        onClick={handleDelete}
                    >
                        Delete Project
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}