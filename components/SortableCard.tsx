'use client'

import { memo } from "react";
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Card from './Card';

interface SortableCardProps {
  card: any;
  projectId: string;
  colId: string;
}

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

  // Style applied to the card wrapper
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.12)' : undefined,
  };

  // Placeholder while dragging
  if (isDragging) {
    return (
      <div
        ref={setNodeRef}
        style={{ ...style, height: 96 }}
        className="w-full relative rounded-lg min-h-[96px] flex items-center justify-center bg-card/50 border border-border"
      >
        {/* Subtle color overlay from theme */}
        <div
          className="absolute inset-0 rounded-lg"
          style={{
            backgroundColor: card.color || 'var(--accent)',
            opacity: 0.12,
          }}
        />
        <span className="relative text-muted-foreground text-sm font-medium">
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
