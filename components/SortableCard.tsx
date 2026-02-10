import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Card from './Card'

interface SortableCardProps {
  card: any
  projectId: string
  colId: string
}

export default function SortableCard({ card, projectId, colId }: SortableCardProps) {
  const { setNodeRef, transform, transition, isDragging, attributes, listeners, node } =
    useSortable({ id: card.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
  };

  if (isDragging) {
    const height = node.current?.offsetHeight;
    return (
      <div
        ref={setNodeRef}
        style={{
          ...style,
          height: height ? `${height}px` : '150px',
          backgroundColor: card.color,
          borderColor: 'rgba(0,0,0,0.3)',
          pointerEvents: 'none', 
         
        }}
       className="w-full rounded-lg border-2 opacity-50 shadow-inner"
      />
    );
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <Card card={card} projectId={projectId} colId={colId} />
    </div>
  );
}