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
interface NewColumnDialog {
    open: boolean
    onClose: () => void,
    projectId : string
}


export function NewColumnDialog({ open, onClose , projectId }: NewColumnDialog) {

    const titleInputRef = useRef<HTMLInputElement>(null)
    const colorInputRef = useRef<HTMLInputElement>(null)
    const addColumn = useProjectStore((state) => state.addColumn)
   

 function handleSubmit(e: React.FormEvent) {
        e.preventDefault(); // Prevents the page from reloading
        let title = titleInputRef.current?.value.trim();
        let color = colorInputRef.current?.value.trim();
        if (title && color) {
            addColumn(projectId , title , color);
            onClose();
        }
    }

    return (

        <Dialog open={open} onOpenChange={onClose}>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Column</DialogTitle>
                    <DialogDescription>
                        set the Colomn Title and color
                    </DialogDescription>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit}>
                <Input   placeholder="e.g., Frontend"  type="text"  ref={titleInputRef}/>
                <Input   type="color"  ref={colorInputRef}/>
                <Button type="submit">Create</Button>
                </form>
            </DialogContent>
        </Dialog>
    )
}