
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
}
    from "@/components/ui/dialog"
interface NewProjectDialog {
    open: boolean
    onClose: () => void
}

export function NewProjectDialog({open , onClose}:NewProjectDialog) {

    return (

        <Dialog open={open} onOpenChange={onClose}>
           
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>create New Project</DialogTitle>
                    <DialogDescription>
                        provide your 
                    </DialogDescription>
                </DialogHeader>
            </DialogContent>
        </Dialog>
    )
}