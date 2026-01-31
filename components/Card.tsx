interface CardProps {
  number: number
  title: string
  color: string
  tasks: { text: string; done: boolean }[]
}

export default function Card({ number, title, color, tasks }: CardProps) {
  const completedTasks = tasks.filter(t => t.done).length

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer">
      {/* Card Header */}
      <div className="flex items-start gap-3 mb-3">
        {/* Number Badge */}
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0"
          style={{ backgroundColor: color }}
        >
          {number}
        </div>
        
        {/* Title */}
        <h4 className="font-semibold text-gray-900 flex-1">{title}</h4>
      </div>

      {/* Tasks Preview */}
      <div className="space-y-2">
        {tasks.slice(0, 3).map((task, idx) => (
          <div key={idx} className="flex items-center gap-2 text-sm">
            <input 
              type="checkbox" 
              checked={task.done}
              className="rounded"
              readOnly
            />
            <span className={task.done ? "line-through text-gray-400" : "text-gray-700"}>
              {task.text}
            </span>
          </div>
        ))}
        {tasks.length > 3 && (
          <p className="text-xs text-gray-500">+{tasks.length - 3} more tasks</p>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {completedTasks}/{tasks.length} completed
        </span>
      </div>
    </div>
  )
}