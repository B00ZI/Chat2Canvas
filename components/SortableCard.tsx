'use client'

import { memo } from "react" // 1. Added memo
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Card from './Card'

interface SortableCardProps {
  card: any;
  projectId: string;
  colId: string;
}

// 2. Wrap the component function in memo
const SortableCard = memo(function SortableCard({ card, projectId, colId }: SortableCardProps) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card
    }
  });

  // 3. Keep this as a plain object (no useMemo needed here)
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // --- PLACEHOLDER ---
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          height: 96,
          backgroundColor: '#fff',
        }}
        className="w-full relative rounded-lg border border-gray-400
                 min-h-0 overflow-hidden flex items-center justify-center opacity-50"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: card.color || '#ccc',
            opacity: 0.12,
          }}
        />
        <span className="relative text-gray-500 text-sm font-medium">
          Drop here
        </span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none" 
    >
      <Card
        card={card}
        projectId={projectId}
        colId={colId}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
});

export default SortableCard;
