'use client'

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverEvent,
  DragOverlay,
  rectIntersection,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  defaultDropAnimationSideEffects,
  MeasuringStrategy
} from '@dnd-kit/core'
import {
  SortableContext,
  horizontalListSortingStrategy,
  arrayMove,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'
import { useState, useRef, useCallback, useEffect, useMemo } from "react"
import { useProjectStore, TEST_MODE } from "@/store/projectStore"
import { useShallow } from "zustand/react/shallow"

import TopBar from "@/components/Topbar"
import { WorkspaceEmpty } from "@/components/WorkspaceEmpty"
import Column from "@/components/Column"
import { ColumnOverlay } from "@/components/ColumnOverlay"
import CardPreview from '@/components/CardPreview'
import { NewColumnDialog } from "@/components/NewColumnDialog"
import { PlusIcon } from "lucide-react"
import type { Column as ColumnType, Card as CardType } from "@/lib/types"

const EMPTY_COLUMNS: ColumnType[] = []

// Pure: move a card between columns in a local board copy (no store, no mutation)
function moveCardInBoard(
  columns: ColumnType[],
  cardId: string,
  toColId: string,
  insertIndex: number,
): ColumnType[] {
  const fromCol = columns.find((c) => c.cards.some((card) => card.id === cardId))
  const toCol = columns.find((c) => c.id === toColId)
  if (!fromCol || !toCol || fromCol.id === toCol.id) return columns
  if (!fromCol.cards.some((c) => c.id === cardId)) return columns
  const card = fromCol.cards.find((c) => c.id === cardId)!
  return columns.map((col) => {
    if (col.id === fromCol.id)
      return { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
    if (col.id === toCol.id) {
      const cards = [...col.cards]
      cards.splice(insertIndex, 0, card)
      return { ...col, cards }
    }
    return col
  })
}

// Pure: reorder a card within its column in a local board copy
function reorderCardInBoard(
  columns: ColumnType[],
  activeId: string,
  overId: string,
): ColumnType[] {
  const col = columns.find((c) => c.cards.some((card) => card.id === activeId))
  if (!col) return columns
  const oldIndex = col.cards.findIndex((c) => c.id === activeId)
  const newIndex = col.cards.findIndex((c) => c.id === overId)
  if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return columns
  return columns.map((cc) =>
    cc.id === col.id ? { ...cc, cards: arrayMove(cc.cards, oldIndex, newIndex) } : cc,
  )
}

export default function Home() {

  const boardRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const activeProjectId = useProjectStore((s) => s.activeProjectId)
  const activeProjectName = useProjectStore(
    useShallow((s) => {
      const p = s.projects.find((p) => p.id === s.activeProjectId)
      return p?.name ?? null
    })
  )
  const searchQuery = useProjectStore((s) => s.searchQuery)
  // Full columns from the store — fallback render source when no local
  // drag board is active. Same <Column> type either way, so switching
  // sources never remounts the board.
  const storeColumns = useProjectStore(
    useShallow((s) => {
      const p = s.projects.find((p) => p.id === s.activeProjectId)
      return p?.columns ?? EMPTY_COLUMNS
    })
  )

  const [activeColumn, setActiveColumn] = useState<ColumnType | null>(null);
  const [activeCard, setActiveCard] = useState<CardType | null>(null);
  const [isNewColumnDialogOpen, setIsNewColumnDialogOpen] = useState(false)

  const isDndActive = useRef(false);

  // Local drag board: pure React state mirror of the columns, driven during
  // drags so Zustand/localStorage are never touched mid-drag. Tagged by
  // projectId so switching projects ignores stale boards without effects.
  type BoardOverride = { projectId: string; columns: ColumnType[] } | null;
  const [boardOv, setBoardOv] = useState<BoardOverride>(null);
  const boardOvRef = useRef<BoardOverride>(null);
  const dragOrigRef = useRef<ColumnType[] | null>(null);
  const setBoard = useCallback((b: BoardOverride) => {
    boardOvRef.current = b;
    setBoardOv(b);
  }, []);
  const activeBoard =
    boardOv && boardOv.projectId === activeProjectId ? boardOv.columns : null;

  // Stores the card's intended destination during drag. Updated on every
  // onDragOver; read once at drop. No board state changes mid-drag.
  const pendingMoveRef = useRef<{ activeId: string; toColId: string; insertIndex: number } | null>(null);

  // Lightweight drop-target indicator: which column (and optionally which
  // card within it) the pointer is over. Only the hovered Column re-renders.
  const [hoveredColId, setHoveredColId] = useState<string | null>(null);
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);

  // Card that just landed at drop — drives the one-shot "card-land" settle
  // animation. Cleared by timer; ref survives re-renders.
  const [landedCardId, setLandedCardId] = useState<string | null>(null);
  const landTimerRef = useRef<number>(0);
  useEffect(() => () => clearTimeout(landTimerRef.current), []);

  // Column that just landed at drop — drives the one-shot "column-land" settle.
  const [landedColumnId, setLandedColumnId] = useState<string | null>(null);
  const columnLandTimerRef = useRef<number>(0);
  useEffect(() => () => clearTimeout(columnLandTimerRef.current), []);

  // Screen-reader announcements for drag operations.
  const [dragAnnounce, setDragAnnounce] = useState<string | null>(null);

  // ── Keyboard shortcuts ─────────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || (e.target as HTMLElement).isContentEditable) return;

      // Escape closes the open card drawer
      if (e.key === "Escape") {
        const { openCard, setOpenCard } = useProjectStore.getState();
        if (openCard) {
          setOpenCard(null);
          e.preventDefault();
        }
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Single render source for the board: local drag board while dragging,
  // otherwise live store data. Identical <Column> type + keys either way,
  // so switching sources never remounts anything.
  const boardColumns = activeBoard ?? storeColumns;
  // Memoized: SortableContext loops if `items` gets a new array identity
  // every render.
  const renderColumnIds = useMemo(
    () => boardColumns.map((c) => c.id),
    [boardColumns],
  );

  // ── Blank-space pan ──────────────────────────────────────────────────
  // Armed by mousedown on empty canvas, executed on mousemove. While a dnd
  // session is active the pan NEVER runs — dnd-kit's edge autoscroll is the
  // single owner of board scrolling whenever a card/column is held.
  // Permanent listeners gated by refs: no add/remove churn, no stale
  // closures, works identically across renders.
  useEffect(() => {
    function onPanMove(e: MouseEvent) {
      if (!isDragging.current || isDndActive.current || !boardRef.current) return;
      const x = e.pageX - boardRef.current.offsetLeft;
      boardRef.current.scrollLeft = scrollLeft.current - (x - startX.current);
    }
    function onPanEnd() {
      isDragging.current = false;
    }

    window.addEventListener("mousemove", onPanMove);
    window.addEventListener("mouseup", onPanEnd);
    return () => {
      window.removeEventListener("mousemove", onPanMove);
      window.removeEventListener("mouseup", onPanEnd);
    };
  }, []);

  /** Disarm any active pan session (called when a dnd drag starts). */
  function stopBoardScroll() {
    isDragging.current = false;
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (!boardRef.current) return;

    // Grabbing a board item must not arm panning — items are dragged via
    // dnd-kit, which handles edge autoscroll itself.
    if ((e.target as HTMLElement).closest("[data-board-item]")) return;

    isDragging.current = true;
    startX.current = e.pageX - boardRef.current.offsetLeft;
    scrollLeft.current = boardRef.current.scrollLeft;
  }



  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );


  const handleDragStart = useCallback((event: DragStartEvent) => {
    isDndActive.current = true;
    // Kill any pan armed by the initial press — from here on, only
    // dnd-kit's edge autoscroll may scroll the board.
    stopBoardScroll();
    const { active } = event;
    const data = active.data.current;
    if (!data) return;

    if (data.type === "Column") {
      setActiveColumn(data.col);
      setDragAnnounce(`Picked up column ${data.col?.title ?? ""}`);
    }
    if (data.type === "Card") {
      setActiveCard(data.card);
      setDragAnnounce(`Picked up card ${data.card?.title ?? ""}`);
    }

    // First drag of the session: snapshot store columns into local state.
    if (!boardOvRef.current) {
      const st = useProjectStore.getState();
      const proj = st.projects.find((p) => p.id === activeProjectId);
      if (proj) {
        setBoard({
          projectId: activeProjectId!,
          columns: proj.columns.map((c) => ({ ...c, cards: [...c.cards] })),
        });
      }
    }
    // Remember pre-drag board so Esc can snap back
    dragOrigRef.current = boardOvRef.current?.columns ?? null;
  }, [activeProjectId, setBoard]);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;
    if (activeId === overId) return;

    const isActiveACard = active.data.current?.type === "Card";
    if (!isActiveACard) return;

    const cur = boardOvRef.current;
    if (!cur || cur.projectId !== activeProjectId) return;

    const cols = cur.columns;
    const overIsColumn = over.data.current?.type === "Column";
    const toCol = overIsColumn
      ? cols.find((c) => c.id === overId)
      : cols.find((c) => c.cards.some((card) => card.id === overId));

    const fromCol = cols.find((c) => c.cards.some((card) => card.id === activeId));
    if (!fromCol || !toCol) return;

    // Always update hover state so the line indicator follows the pointer
    setHoveredColId(toCol.id);
    setHoveredCardId(overIsColumn ? null : overId);

    // Same column: no cross-column move needed, clear any stale destination
    if (fromCol.id === toCol.id) {
      pendingMoveRef.current = null;
      return;
    }

    let insertIndex = toCol.cards.length;
    if (!overIsColumn) {
      const idx = toCol.cards.findIndex((c) => c.id === overId);
      if (idx >= 0) insertIndex = idx;
    }

    // Cross-column: record where the card should land at drop
    pendingMoveRef.current = { activeId, toColId: toCol.id, insertIndex };
  }, [activeProjectId]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    isDndActive.current = false;
    const { active, over } = event;
    setActiveCard(null);
    setActiveColumn(null);
    setHoveredColId(null);
    setHoveredCardId(null);


    const cur = boardOvRef.current;
    if (!cur || cur.projectId !== activeProjectId) return;

    let cols = cur.columns;

    // 1. Apply cross-column move from pendingMoveRef (if any)
    const pending = pendingMoveRef.current;
    if (pending) {
      cols = moveCardInBoard(cols, pending.activeId, pending.toColId, pending.insertIndex);
    }
    pendingMoveRef.current = null;

    // 2. Apply column reorder (if dragging a column)
    if (
      over &&
      active.data.current?.type === "Column" &&
      active.id !== over.id
    ) {
      const ids = cols.map((c) => c.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        cols = arrayMove(cols, oldIndex, newIndex);
      }
    }

    // 3. Apply within-column reorder (if card stayed in same column)
    if (over && active.data.current?.type === "Card" && !pending) {
      cols = reorderCardInBoard(cols, active.id as string, over.id as string);
    }

    // Single state update at drop — one discrete layout reflow
    if (cols !== cur.columns) {
      setBoard({ projectId: cur.projectId, columns: cols });

      // Settle animation on the card or column that just moved
      if (active.data.current?.type === "Card") {
        const movedId = active.id as string;
        setLandedCardId(movedId);
        clearTimeout(landTimerRef.current);
        landTimerRef.current = window.setTimeout(() => setLandedCardId(null), 450);
      } else if (active.data.current?.type === "Column") {
        setLandedColumnId(active.id as string);
        clearTimeout(columnLandTimerRef.current);
        columnLandTimerRef.current = window.setTimeout(() => setLandedColumnId(null), 350);
      }
    }

    // Production path: exactly ONE store write per drag, then release control.
    if (!TEST_MODE) {
      useProjectStore.getState().replaceProjectColumns(cur.projectId, cols);
      setBoard(null);
    }

    // Announce drop to screen readers
    const typeName = active.data.current?.type === "Card" ? "card" : "column";
    setDragAnnounce(`Dropped ${typeName}`);
    setTimeout(() => setDragAnnounce(null), 1000);
  }, [activeProjectId, setBoard]);

  const handleDragCancel = useCallback(() => {
    isDndActive.current = false;
    setActiveCard(null);
    setActiveColumn(null);
    setHoveredColId(null);
    setHoveredCardId(null);
    setDragAnnounce("Drag cancelled");


    pendingMoveRef.current = null;

    // Snap back to pre-drag board
    const pid = boardOvRef.current?.projectId ?? activeProjectId;
    if (!pid) return;
    setBoard(dragOrigRef.current ? { projectId: pid, columns: dragOrigRef.current } : null);
  }, [activeProjectId, setBoard]);

  if (!activeProjectId || !activeProjectName) return <WorkspaceEmpty />;

  const columnsList = boardColumns.map((col) => (
    <Column
      key={col.id}
      col={col}
      projectId={activeProjectId}
      isDndActive={isDndActive}
      isDropTarget={hoveredColId === col.id}
      hoveredCardId={hoveredColId === col.id ? hoveredCardId : null}
      landedCardId={landedCardId}
      landedColumnId={landedColumnId}
      searchQuery={searchQuery}
    />
  ));

  return (
    <div className="flex-1 bg-background flex flex-col overflow-hidden ">
      <TopBar />

      {/* Screen-reader live region for drag announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {dragAnnounce}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection}
        autoScroll={{
          // Engage horizontal edge-scroll slightly earlier than the
          // default on wide boards.
          threshold: { x: 0.18, y: 0.25 },
        }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        measuring={{
          droppable: {
            // Re-measure during drag: the collapsed ghost + "Drop here"
            // indicator shift layout after grab, so cached rects go stale.
            strategy: MeasuringStrategy.WhileDragging,
          },
        }}
      >
        <div
          ref={boardRef}
          onMouseDown={handleMouseDown}
          className="canvas-dots p-6 flex-1 overflow-x-auto overflow-y-hidden scrollbar-slim"
        >
          <div role="list" aria-label="Columns" className="flex h-full items-start gap-4 pr-1">
            <SortableContext
              items={renderColumnIds}
              strategy={horizontalListSortingStrategy}
            >
              {columnsList}
            </SortableContext>

            {/* Add column — same ghost-tile affordance as Add card */}
            <div className="w-72 shrink-0 pt-0.5">
              <button
                onClick={() => setIsNewColumnDialogOpen(true)}
                className="
                  w-full flex items-center justify-center gap-2
                  cursor-pointer border border-dashed border-border
                  rounded-xl p-3 text-sm font-medium text-muted-foreground
                  transition-colors duration-150 bg-card/40 backdrop-blur-[1px]
                  hover:border-primary/50 hover:bg-primary/5 hover:text-primary
                  focus-visible:ring-ring focus-visible:ring-2 focus-visible:outline-none
                "
              >
                <PlusIcon className="size-4" />
                Add column
              </button>

              <NewColumnDialog
                open={isNewColumnDialogOpen}
                onClose={() => setIsNewColumnDialogOpen(false)}
                projectId={activeProjectId}
              />
            </div>
          </div>
        </div>

        <DragOverlay
          adjustScale={false}
          className="pointer-events-none"
          dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: { active: { opacity: "0.6" } },
            }),
          }}
        >
          {activeColumn ? (
            <ColumnOverlay col={activeColumn} />
          ) : null}

          {activeCard ? (
            <div
              className="cursor-grabbing
                       bg-card border border-border-strong
                       shadow-xl rounded-xl"
            >
              <CardPreview
                card={activeCard}
                projectId={activeProjectId}
                colId=""
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )

}
