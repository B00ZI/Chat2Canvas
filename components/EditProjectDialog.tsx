'use client'
import { useRef } from "react"

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
  projectName: string
  projectId: string
}

export function EditProjectDialog({ open, onClose, projectName, projectId }: EditProjectDialog) {
  const inputRef = useRef<HTMLInputElement>(null)
  const editProject = useProjectStore((state) => state.editProject)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    let name = inputRef.current?.value
    if (name && name.trim()) {
      editProject(projectId, name)
      if (inputRef.current) {
        inputRef.current.value = ""
      }
      onClose()
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
          Rename Project
        </DialogTitle>
      </DialogHeader>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-foreground">
            Project Name
          </label>

          <Input
            type="text"
            ref={inputRef}
            defaultValue={projectName}
            autoFocus
            className=" focus-visible:ring-offset-0  focus-visible:ring-2   bg-background"
          />
        </div>

        <div className="flex justify-end gap-2">
           <Button variant={'outline'} onClick={()=>onClose()} type="button" className="" >
            Cancel
          </Button>

          <Button type="submit" className="">
            Save Changes 
          </Button>
          
        </div>
      </form>
    </DialogContent>
  </Dialog>
);

}