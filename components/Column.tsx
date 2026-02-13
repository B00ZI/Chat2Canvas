'use client'

import { useState, useMemo, memo } from "react" // 1. Added memo
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import SortableCard from "./SortableCard"
import { EditColumnDialog } from "./EditColumnDialog"
import { NewCardDialog } from "./NewCardDialog "

interface ColumnProps {
    col: {
        id: string;
        title: string;
        color: string;
        cards: any[];
    };
    projectId: string;
}

// 2. Wrap the entire component in memo
const Column = memo(function Column({ col, projectId }: ColumnProps) {
    const [isEditColumnDialogOpen, setIsEditColumnDialogOpen] = useState(false)
    const [isNewCardDialogOpen, setisNewCardDialogOpen] = useState(false)

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: col.id,
        data: {
            type: "Column",
            col,
        },
    });

    // 3. Use Transform for better layout stability during multi-axis drags
    const style = {
        transition,
        transform: CSS.Transform.toString(transform),
        willChange: 'transform' ,
    };

    const cardIds = useMemo(() => col.cards.map(card => card.id), [col.cards]);

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-80 shrink-0 relative rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/10 h-125 flex items-center justify-center opacity-50"
            />
        )
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="bg-white rounded-lg p-4 w-80 shrink-0 flex flex-col max-h-[80vh] shadow-sm border border-gray-200"
        >
            <div className="mb-4">
                <div className="h-1 rounded-t-lg mb-3" style={{ backgroundColor: col.color }} />
                <div
                    {...attributes}
                    {...listeners}
                    className="flex items-center justify-between cursor-grab active:cursor-grabbing select-none"
                >
                    <div className="flex flex-col">
                        <h3 className="font-semibold text-lg text-gray-900 truncate max-w-37.5">{col.title}</h3>
                        <span className="text-xs text-gray-400 font-medium">
                            {col.cards.length} {col.cards.length === 1 ? 'TASK' : 'TASKS'}
                        </span>
                    </div>
                    <button
                        onPointerDown={(e) => e.stopPropagation()} 
                        onClick={() => setIsEditColumnDialogOpen(true)}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-50 rounded transition-colors"
                    >
                        ⋮
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-12.5 p-1 space-y-3 custom-scrollbar">
                <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
                    {col.cards.map((card) => (
                        <SortableCard
                            key={card.id}
                            card={card}
                            projectId={projectId}
                            colId={col.id}
                        />
                    ))}
                </SortableContext>
            </div>

            <button
                onClick={() => setisNewCardDialogOpen(true)}
                className="mt-3 w-full flex items-center justify-center gap-2 cursor-pointer border-2 border-dashed border-gray-100 rounded-lg p-3 text-sm font-medium text-gray-500 transition-all hover:bg-gray-50 hover:border-gray-200 hover:text-gray-700"
            >
                <span className="text-lg">+</span> Add New Card
            </button>

            <EditColumnDialog open={isEditColumnDialogOpen} onClose={() => setIsEditColumnDialogOpen(false)} projectId={projectId} col={col} />
            <NewCardDialog open={isNewCardDialogOpen} onClose={() => setisNewCardDialogOpen(false)} colId={col.id} projectId={projectId} />
        </div>
    )
});

export default Column;
