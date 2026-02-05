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

interface EditProjectDialog {
  open: boolean
  onClose: () => void
  projectId: string,
  colId: string
}

export function EditColumnDialog({ open, onClose, projectId, colId }: EditProjectDialog) {
   


  const titleInputRef = useRef<HTMLInputElement>(null)
  const colorInputRef = useRef<HTMLInputElement>(null)

  const projects = useProjectStore((state) => state.projects)


  const project = projects.find(p => p.id === projectId)
  const col = project?.columns.find(col => col.id === colId)


  const editColumn = useProjectStore((state) => state.editColumn)
  const deleteColumn = useProjectStore((state) => state.deleteColumn)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    let newTitle = titleInputRef.current?.value.trim()
    let newColor = colorInputRef.current?.value.trim()


    if (newTitle && newColor) {
      editColumn(projectId, colId, newTitle)
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
    deleteColumn(projectId ,colId)
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
            <label className="text-sm font-medium  ">Project Name</label>
            <Input
              type="text"
              ref={titleInputRef}
              defaultValue={col?.title}
              autoFocus
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