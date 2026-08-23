import { Column } from "@/lib/types"

interface ColumnOverlayProps {
  col: Column
}

export function ColumnOverlay({ col }: ColumnOverlayProps) {
  return (
    <div
      className="bg-card rounded-lg p-4 w-80 shrink-0 flex flex-col max-h-[80vh]
                 shadow-xs border border-border opacity-90"
    >
      <div className="mb-4">
        <div
          className="h-1 rounded-t-lg mb-3"
          style={{ backgroundColor: col.color }}
        />
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col min-w-0">
            <h3 className="font-semibold text-sm text-foreground truncate max-w-[9.5rem]">
              {col.title}
            </h3>
            <span className="text-[11px] text-muted-foreground font-medium tracking-wide">
              {col.cards.length} {col.cards.length === 1 ? "TASK" : "TASKS"}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-12.5 py-3 space-y-3">
        {col.cards.map((card) => (
          <div
            key={card.id}
            className="bg-card text-card-foreground w-full
                       border border-border rounded-lg p-4
                       shadow-xs"
          >
            <h4 className="font-medium text-sm text-foreground truncate">
              {card.title}
            </h4>
            {card.tasks.length > 0 && (
              <p className="text-[11px] text-muted-foreground mt-2">
                {card.tasks.filter(t => t.done).length}/{card.tasks.length} tasks
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
