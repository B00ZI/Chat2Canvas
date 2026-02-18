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
    <DialogContent
      className="
        bg-card text-card-foreground
        border border-border
        shadow-lg
        rounded-lg
      "
    >
      <DialogHeader>
        <DialogTitle className="tracking-tight">
          Create New Project
        </DialogTitle>

        <DialogDescription className="text-muted-foreground">
          Provide your project name
        </DialogDescription>
      </DialogHeader>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <Input
          ref={inputRef}
          type="text"
          placeholder="e.g., My Awesome App"
          className="bg-background"
        />

        <Button type="submit">
          Create
        </Button>
      </form>
    </DialogContent>
  </Dialog>
);

}