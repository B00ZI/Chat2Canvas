'use client'
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

interface Column {
  id: string;
  title: string;
  color: string;
  cards: Card[];
}


interface EditProjectDialog {
  open: boolean
  onClose: () => void
  projectId: string,
  col: Column
}

export function EditColumnDialog({ open, onClose, projectId, col }: EditProjectDialog) {



  const titleInputRef = useRef<HTMLInputElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)

  const editColumn = useProjectStore((state) => state.editColumn)
  const deleteColumn = useProjectStore((state) => state.deleteColumn)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let newTitle = titleInputRef.current?.value.trim()
    let newColor = colorInputRef.current?.value.trim()


    if (newTitle && newColor ) {
      editColumn(projectId, col.id, {title: newTitle , color: newColor})
      if (titleInputRef.current) {
        titleInputRef.current.value = ""
      }
      if (colorInputRef.current) {
        colorInputRef.current.value = ""
      }
      onClose()
    }
  }

  function handleDelete() {
    deleteColumn(projectId, col.id)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
        </DialogHeader>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium  ">Column Title</label>
            <Input
              type="text"
              ref={titleInputRef}
              defaultValue={col?.title}
              autoFocus
            />
            <label className="text-sm font-medium  ">Column Color</label>
            <Input
              type="color"
              ref={colorInputRef}
              defaultValue={col?.color}
              
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Save Changes
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" type="button" className="flex-1">
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete "{col?.title}" column ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this Column .
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete}>
                    Delete Column
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}