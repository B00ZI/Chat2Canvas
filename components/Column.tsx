
import { useState } from "react"
import Card from "./Card"
import { EditColumnDialog } from "./EditColumnDialog"
import { NewCardDialog } from "./NewCardDialog "
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'


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

export default function Column({ col, projectId }: ColumnProps) {

    const cardIds = col.cards.map(c => c.id)

    const [isEditColumnDialogOpen, setIsEditColumnDialogOpen] = useState(false)
    const [isNewCardDialogOpen, setisNewCardDialogOpen] = useState(false)
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
                    <button onClick={() => setIsEditColumnDialogOpen(true)} className="text-gray-400 hover:text-gray-600">⋮</button>
                    <EditColumnDialog open={isEditColumnDialogOpen} onClose={() => setIsEditColumnDialogOpen(false)} projectId={projectId} col={col} />
                </div>
            </div>

            <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                <div className="space-y-3 mb-3">
                    {col.cards.map((card, x) =>


                        <Card
                            key={card.id}
                            card={card}
                            projectId={projectId}
                            colId={col.id}
                        />

                    )}
                </div>
            </SortableContext>

            {/* Add Card Button */}
            <button onClick={() => setisNewCardDialogOpen(true)} className="w-full flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-200 rounded-lg p-3 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:border-gray-300! hover:text-gray-700">
                <span className="text-lg">+</span>
                Add New Card
            </button>
            <NewCardDialog open={isNewCardDialogOpen} onClose={() => setisNewCardDialogOpen(false)} colId={col.id} projectId={projectId} />

        </div>
    )
}