import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { Folder } from "lucide-react"
import { useState } from "react"
import AIToolsModal from "./AIToolsModal"
import { NewProjectDialog } from "./NewProjectDialog"
export function EmptyDemo() {

  const [isToolsOpen, setIsToolsOpen] = useState(false)
  const [isNewProjecOpen, setIsNewProjecOpen] = useState(false)

  return (
    <>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Folder className="text-muted-foreground" />
          </EmptyMedia>

          <EmptyTitle>
            No projects yet
          </EmptyTitle>

          <EmptyDescription>
            Start a new project from scratch, or let the Canvas tools guide you
            to use Ai to create one in seconds.
          </EmptyDescription>
        </EmptyHeader>

        <EmptyContent className="flex-row justify-center gap-2">
          <Button onClick={() => setIsToolsOpen(true)}>
            Start with Canvas tools
          </Button>

          <Button onClick={() => setIsNewProjecOpen(true)} variant="outline">
            Create project manually
          </Button>
        </EmptyContent>
      </Empty>

      <AIToolsModal
        open={isToolsOpen}
        onClose={() => setIsToolsOpen(false)}
      />

      <NewProjectDialog
        open={isNewProjecOpen}
        onClose={() => setIsNewProjecOpen(false)}
      />
    </>
  )
}
