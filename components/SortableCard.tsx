import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Card from './Card'

interface SortableCardProps {
  card: any;
  projectId: string;
  colId: string;
}

export default function SortableCard({ card, projectId, colId }: SortableCardProps) {
  const {
    setNodeRef,
    transform,
    transition,
    isDragging,
    attributes,
    listeners,
    node
  } = useSortable({
    id: card.id,
    data: {
      type: "Card",
      card
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // --- PLACEHOLDER ---
  // --- PLACEHOLDER ---
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          height: 96, // ✅ fixed height (px)
          backgroundColor: '#fff',
        }}
        className="w-full relative rounded-lg border border-gray-600
                 min-h-0 overflow-hidden flex items-center justify-center"
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: card.color || '#ccc',
            opacity: 0.12, // ✅ very light / sub color
          }}
        />

        <span className="relative text-gray-600 text-sm font-medium">
          Drop here
        </span>
      </div>
    );
  }




  return (
    <div
      ref={setNodeRef}
      style={style}
      className="touch-none h-full"
    >
      <Card
        card={card}
        projectId={projectId}
        colId={colId}
        // Pass drag listeners down instead of applying them to the container
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}