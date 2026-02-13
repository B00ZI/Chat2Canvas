import { memo, useState , useCallback } from "react";
import { useProjectStore } from "@/store/projectStore";
import { EditCardDialog } from "./EditCardDialog";

interface CardType {
  id: string
  number: number
  title: string
  color: string
  tasks: { text: string; done: boolean }[]
}

interface CardProps {
  card: CardType,
  projectId: string,
  colId: string,
  dragHandleProps?: any // Receive the drag listeners here
}

function Card({ card, projectId, colId, dragHandleProps }: CardProps) {
  const [isEditCardDialogOpen, setIsEditCardDialogOpen] = useState(false)
  const toggleTask = useProjectStore(useCallback((state) => state.toggleTask, []))
  
  const tasks = card?.tasks || [];
  const completedTasks = tasks.filter(t => t?.done).length || 0;

  return (
    // "group" class used for hover effects on the edit button
    <div className="bg-white h-full w-full border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow relative group">
      
      {/* --- CARD HEADER (DRAGGABLE AREA) --- */}
      {/* We apply dragHandleProps HERE only */}
      <div 
        {...dragHandleProps}
        className="flex items-start gap-3 mb-3 cursor-grab active:cursor-grabbing touch-none select-none"
      >
        {/* Number Badge */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-sm pointer-events-none"
          style={{ backgroundColor: card.color , willChange: 'transform' , }}
        >
          {card.number}
        </div>

        
        <h4 className="font-semibold text-gray-900 flex-1 wrap-break-word pointer-events-none">
          {card.title}
        </h4>
        
        {/* Edit Button */}
        {/* We must stop propagation so clicking this doesn't start a drag */}
        <button 
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => {
            e.stopPropagation();
            setIsEditCardDialogOpen(true);
          }} 
          className="text-gray-400 hover:text-gray-600 p-1 -mr-2 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
              // Double safety: stop propagation here too
              onPointerDown={(e) => e.stopPropagation()}
              onChange={() => toggleTask(projectId, colId, card.id, idx)}
              type="checkbox"
              checked={task.done}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className={`truncate ${task.done ? "line-through text-gray-400" : "text-gray-700"}`}>
              {task.text}
            </span>
          </div>
        ))}
        {tasks.length > 3 && (
          <p className="text-xs text-gray-500 pl-6">
            +{tasks.length - 3} more tasks
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between cursor-default">
        <span className="text-xs text-gray-500 font-medium">
          {completedTasks}/{tasks.length} completed
        </span>
      </div>
    </div>
  )
}

export default memo(Card);