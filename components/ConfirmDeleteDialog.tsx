'use client'

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

interface ConfirmDeleteDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
}

export function ConfirmDeleteDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: ConfirmDeleteDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent
        className="
          bg-popover text-popover-foreground
          border border-border
          shadow-lg
          rounded-lg
        "
      >
        <AlertDialogHeader>
          <AlertDialogTitle>
            {title}
          </AlertDialogTitle>

          <AlertDialogDescription className="text-muted-foreground">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            onClick={onConfirm}
            className="
              bg-destructive text-destructive-foreground
              hover:opacity-90
            "
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
