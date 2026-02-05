
import { useState } from "react"
import Card from "./Card"
import { EditColumnDialog } from "./EditColumnDialog"

interface ColumnProps {
    title: string
    color: string
    cardCount: number
}

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

interface ColumnProps {
  col: Column;
  projectId: string; // Add this!
}

export default function Column( {col , projectId} : {col:ColumnProps}) {

const [isEditColumnDialogOpen , setIsEditColumnDialogOpen] = useState(false)
    return (
        <div className="bg-white rounded-lg p-4 w-80 shrink-0 shadow-sm border border-gray-200">
            {/* Column Header */}
            <div className="mb-4">
                <div className="h-1 rounded-t-lg mb-3" style={{ backgroundColor: col.color }} />
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-lg">{col.title}</h3>
                        {/* <p className="text-sm text-gray-500">{cardCoun} tasks</p> */}
                    </div>
                    <button onClick={} className="text-gray-400 hover:text-gray-600">⋮</button>
                    <EditColumnDialog open={isEditColumnDialogOpen} onClose={() => setIsEditColumnDialogOpen(false)} projectId={} colId={col.id} />
                </div>
            </div>
           
            {/* Cards go here - empty for now */}

            <div className="space-y-3 mb-3">
                <Card
                    number={1}
                    title="Setup Database"
                    color= {col.color}
                    tasks={[
                        { text: "Create schema", done: true },
                        { text: "Setup migrations", done: false },
                        { text: "Add seed data", done: false }
                    ]}
                />
            </div>

            {/* Add Card Button */}
            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600">
                + Add New Task
            </button>
        </div>
    )
}