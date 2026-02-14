'use client'

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  rectIntersection, // Changed: More performant for cross-column transitions
  PointerSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  MeasuringStrategy
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useState, useMemo, useRef, useCallback } from "react"
import { useProjectStore } from "@/store/projectStore"

import TopBar from "@/components/Topbar"
import EmptyState from "@/components/WorkeSpaceEmpty"
import Column from "@/components/Column"
import Card from "@/components/Card"
import { Button } from "@/components/ui/button"
import { NewColumnDialog } from "@/components/NewColumnDialog "

export default function Home() {
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const activeProject = useProjectStore((state) =>
    state.projects.find(p => p.id === state.activeProjectId)
  )
  const reorderCards = useProjectStore((state) => state.reorderCards)
  const moveCardBetweenColumns = useProjectStore((state) => state.moveCardBetweenColumns)
  const reorderColumns = useProjectStore((state) => state.reorderColumns)

  const [activeColumn, setActiveColumn] = useState<any | null>(null);
  const [activeCard, setActiveCard] = useState<any | null>(null);
  const [isNewColumnDialogOpen, setIsNewColumnDialogOpen] = useState(false)

  const isUpdating = useRef(false);

  const columnIds = useMemo(() =>
    activeProject?.columns.map(col => col.id) || [],
    [activeProject?.columns]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;
    if (!data) return;

    if (data.type === "Column") setActiveColumn(data.col);
    if (data.type === "Card") setActiveCard(data.card);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeProject || isUpdating.current) return;

    const activeId = active.id;
    const overId = over.id;
    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === "Card";
    if (!isActiveACard) return;

    // Use findIndex or cached data if possible, but keep logic surgical
    const activeCol = activeProject.columns.find(c => c.cards.some(card => card.id === activeId));
    
    // Optimization: Check if 'over' is a column directly first
    const overCol = over.data.current?.type === "Column"
      ? activeProject.columns.find(c => c.id === overId)
      : activeProject.columns.find(c => c.cards.some(card => card.id === overId));

    if (!activeCol || !overCol || activeCol.id === overCol.id) return;

    isUpdating.current = true;

    let insertIndex = overCol.cards.length;
    if (over.data.current?.type === "Card") {
      const index = overCol.cards.findIndex(c => c.id === overId);
      if (index >= 0) insertIndex = index;
    }

    moveCardBetweenColumns(activeProject.id, activeId as string, activeCol.id, overCol.id, insertIndex);

    // Shorten tick for faster response
    setTimeout(() => { isUpdating.current = false; }, 0);
  }, [activeProject, moveCardBetweenColumns]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);

    if (!over || !activeProject) return;

    if (active.data.current?.type === "Column" && active.id !== over.id) {
      const oldIndex = columnIds.indexOf(active.id as string);
      const newIndex = columnIds.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderColumns(activeProject.id, oldIndex, newIndex);
      }
    }

    const col = activeProject.columns.find(c => c.cards.some(card => card.id === active.id));
    if (col) {
      const oldIndex = col.cards.findIndex(c => c.id === active.id);
      const newIndex = col.cards.findIndex(c => c.id === over.id);
      if (oldIndex !== newIndex && newIndex !== -1) {
        reorderCards(activeProject.id, col.id, oldIndex, newIndex);
      }
    }

    useProjectStore.getState().syncProjectNumbers(activeProject.id);
  }, [activeProject, columnIds, reorderCards, reorderColumns]);

  if (!activeProject) return <EmptyState />;

  return (
    <div className="flex-1 bg-gray-50 h-screen flex flex-col overflow-hidden">
      <TopBar />
      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection} // Changed: Faster geometric calculation
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            // Optimization: Only measure containers when dragging starts
            strategy: MeasuringStrategy.WhileDragging, 
          }
        }}
      >
        
        <div className="p-6 flex-1 overflow-x-auto overflow-y-hidden">
          <div className="flex gap-4 h-full items-start">
            <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
              {activeProject.columns.map((col) => (
                <Column key={col.id} col={col} projectId={activeProject.id} />
              ))}
            </SortableContext>

            <div className="bg-white rounded-lg p-4 w-80 shrink-0 shadow-sm border border-gray-200">
              <Button onClick={() => setIsNewColumnDialogOpen(true)} className="w-full">+ Add Column</Button>
              <NewColumnDialog open={isNewColumnDialogOpen} onClose={() => setIsNewColumnDialogOpen(false)} projectId={activeProject.id} />
            </div>
          </div>
        </div>

        
        <DragOverlay 
          className="pointer-events-none" 
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } })
          }}
        >
          {activeColumn ? <Column col={activeColumn} projectId={activeProject.id} /> : null}
          {activeCard ? (
            <div className="cursor-grabbing shadow-2xl rounded-lg bg-white border border-gray-200">
              <Card card={activeCard} projectId={activeProject.id} colId="" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
