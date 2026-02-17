'use client'

import { memo, useState, useCallback } from "react";
import { useProjectStore } from "@/store/projectStore";
import { EditCardDialog } from "./EditCardDialog";

interface CardType {
  id: string;
  number: number;
  title: string;
  color: string;
  tasks: { text: string; done: boolean }[];
}

interface CardProps {
  card: CardType;
  projectId: string;
  colId: string;
  dragHandleProps?: any; // Drag listeners from SortableCard
}

function Card({ card, projectId, colId, dragHandleProps }: CardProps) {
  const [isEditCardDialogOpen, setIsEditCardDialogOpen] = useState(false);
  const toggleTask = useProjectStore(useCallback((state) => state.toggleTask, []));

  const tasks = card?.tasks || [];
  const completedTasks = tasks.filter(t => t?.done).length || 0;

  return (
    <div
      className="card bg-card text-card-foreground w-full border border-border rounded-lg p-4 hover:shadow-md transition-shadow relative group"
    >
      {/* --- CARD HEADER (DRAGGABLE AREA) --- */}
      <div
        {...dragHandleProps}
        className="flex items-start gap-3 mb-3 cursor-grab active:cursor-grabbing touch-none select-none"
      >
        {/* Number Badge */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm pointer-events-none"
          style={{ backgroundColor: card.color, willChange: 'transform' }}
        >
          {card.number}
        </div>

        {/* Title */}
        <h4 className="font-semibold text-foreground flex-1 break-words pointer-events-none">
          {card.title}
        </h4>

        {/* Edit Button */}
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setIsEditCardDialogOpen(true);
          }}
          className="text-muted-foreground hover:text-foreground p-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
        >
          ⋮
        </button>

        <EditCardDialog
          open={isEditCardDialogOpen}
          onClose={() => setIsEditCardDialogOpen(false)}
          projectId={projectId}
          colId={colId}
          card={card}
        />
      </div>

      {/* --- TASKS (NON-DRAGGABLE) --- */}
      <div className="space-y-2 cursor-default">
        {tasks.slice(0, 3).map((task, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={task.done}
              onChange={() => toggleTask(projectId, colId, card.id, idx)}
              onPointerDown={(e) => e.stopPropagation()}
              className="rounded border-border text-primary focus:ring-primary cursor-pointer"
            />
            <span className={`truncate ${task.done ? "line-through text-muted-foreground" : "text-foreground"}`}>
              {task.text}
            </span>
          </div>
        ))}
        {tasks.length > 3 && (
          <p className="text-xs text-muted-foreground pl-6">
            +{tasks.length - 3} more tasks
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between cursor-default">
        <span className="text-xs text-muted-foreground font-medium">
          {completedTasks}/{tasks.length} completed
        </span>
      </div>
    </div>
  );
}

export default memo(Card);
