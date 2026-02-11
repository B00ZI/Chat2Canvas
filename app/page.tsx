'use client'

import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverEvent, 
  DragOverlay, 
  pointerWithin, 
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
import { useState, useMemo, useCallback } from "react"
import { useProjectStore } from "@/store/projectStore"

import TopBar from "@/components/Topbar"
import EmptyState from "@/components/WorkeSpaceEmpty"
import Column from "@/components/Column"
import Card from "@/components/Card"
import { Button } from "@/components/ui/button"
import { NewColumnDialog } from "@/components/NewColumnDialog "

export default function Home() {
  const projects = useProjectStore((state) => state.projects)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const reorderCards = useProjectStore((state) => state.reorderCards)
  const moveCardBetweenColumns = useProjectStore((state) => state.moveCardBetweenColumns)
  // --- GET REORDER COLUMNS ACTION ---
  const reorderColumns = useProjectStore((state) => state.reorderColumns)
  
  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId), 
    [projects, activeProjectId]
  )

  const columnIds = useMemo(() => 
    activeProject?.columns.map(col => col.id) || [], 
    [activeProject]
  )

  const [isNewColumnDialogOpen, setIsNewColumnDialogOpen] = useState<boolean>(false)
  const [activeColumn, setActiveColumn] = useState<any | null>(null);
  const [activeCard, setActiveCard] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 }
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current;
    if (!data) return;

    if (data.type === "Column") {
      setActiveColumn(data.col);
      setActiveCard(null);
    } else if (data.type === "Card") {
      setActiveCard(data.card);
      setActiveColumn(null);
    }
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over || !activeProject) return;
    if (active.id === over.id) return;

    const isActiveACard = active.data.current?.type === "Card";
    if (!isActiveACard) return;

    const activeId = active.id;
    const overId = over.id;

    const activeCol = activeProject.columns.find(c => 
      c.cards.some(card => card.id === activeId)
    );
    
    const overCol = over.data.current?.type === "Column"
      ? activeProject.columns.find(c => c.id === overId)
      : activeProject.columns.find(c => c.cards.some(card => card.id === overId));

    if (!activeCol || !overCol) return;

    if (activeCol.id !== overCol.id) {
      let insertIndex = overCol.cards.length;
      if (over.data.current?.type === "Card") {
        const index = overCol.cards.findIndex(c => c.id === overId);
        if (index >= 0) insertIndex = index;
      }

      moveCardBetweenColumns(
        activeProject.id, 
        activeId as string, 
        activeCol.id, 
        overCol.id,
        insertIndex
      );
    }
  }, [activeProject, moveCardBetweenColumns]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveCard(null);
    setActiveColumn(null);

    const { active, over } = event;
    if (!over || !activeProject) return;

    // --- 1. COLUMN REORDERING LOGIC ---
    if (active.data.current?.type === "Column") {
      if (active.id !== over.id) {
        const oldIndex = activeProject.columns.findIndex(c => c.id === active.id);
        const newIndex = activeProject.columns.findIndex(c => c.id === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
          reorderColumns(activeProject.id, oldIndex, newIndex);
        }
      }
      return;
    }

    // --- 2. CARD REORDERING (Same Column) ---
    const col = activeProject.columns.find(c => 
      c.cards.some(card => card.id === active.id)
    );
    
    if (col) {
      const oldIndex = col.cards.findIndex(c => c.id === active.id);
      const newIndex = col.cards.findIndex(c => c.id === over.id);

      if (oldIndex !== newIndex && newIndex !== -1) {
        reorderCards(activeProject.id, col.id, oldIndex, newIndex);
      }
    }
  }, [activeProject, reorderCards, reorderColumns]); // Added reorderColumns dependency

  return (
    <div className="flex-1 bg-gray-50 h-screen flex flex-col overflow-hidden">
      <TopBar />

      {!activeProject ? (
        <EmptyState />
      ) : (
        <DndContext 
          sensors={sensors}
          collisionDetection={pointerWithin} 
          onDragStart={handleDragStart} 
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
        >
          <div className="p-6 flex-1 overflow-x-auto overflow-y-hidden">
            <div className="flex gap-4 h-full items-start">
              
              <SortableContext items={columnIds} strategy={horizontalListSortingStrategy}>
                {activeProject.columns.map((col) => (
                  <Column 
                    key={col.id} 
                    col={col} 
                    projectId={activeProject.id} 
                  />
                ))}
              </SortableContext>

              <div className="bg-white rounded-lg p-4 w-80 shrink-0 shadow-sm border border-gray-200">
                <Button 
                  onClick={() => setIsNewColumnDialogOpen(true)} 
                  className="w-full"
                >
                  + Add Column
                </Button>
                <NewColumnDialog 
                  open={isNewColumnDialogOpen} 
                  onClose={() => setIsNewColumnDialogOpen(false)} 
                  projectId={activeProject.id} 
                />
              </div>

            </div>
          </div>

          <DragOverlay 
            className="z-50"
            dropAnimation={{
              sideEffects: defaultDropAnimationSideEffects({
                styles: { active: { opacity: '0.5' } },
              }),
          }}>
            {activeColumn && (
              <div className="opacity-100">
                <Column col={activeColumn} projectId={activeProject.id} />
              </div>
            )}
            {activeCard && (
               <div 
                 className="cursor-grabbing shadow-2xl rounded-lg bg-white"
                 style={{ 
                   border: `1px solid ${activeCard.color || '#e5e7eb'}`, 
                 }}
               >
                  <Card card={activeCard} projectId={activeProject.id} colId="" />
               </div>
            )}
          </DragOverlay>
        </DndContext>
      )}
    </div>
  )
}