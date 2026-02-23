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

export function EmptyDemo() {
  return (
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
        <Button>
          Start with Canvas tools
        </Button>

        <Button variant="outline">
          Create project manually
        </Button>
      </EmptyContent>
    </Empty>
  )
}
