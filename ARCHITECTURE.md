# Chat2Canvas - Technical Architecture Deep Dive

## System Flow Diagrams

### Component Hierarchy

```
app/layout.tsx (RootLayout)
├── Sidebar
│   ├── NewProjectDialog
│   ├── EditProjectDialog
│   ├── ConfirmDeleteDialog
│   └── Search (animated)
├── main
│   └── app/page.tsx (Home)
│       ├── Topbar
│       │   └── AIToolsModal
│       │       ├── Start Fresh Tab (Creator Prompt)
│       │       ├── Import Tab (Paste JSON)
│       │       └── Export Tab (Copy Progress)
│       ├── DndContext (horizontal columns)
│       │   ├── SortableContext (columns)
│       │   │   └── Column[] (mapped)
│       │   │       ├── Column Header (drag handle, dropdown)
│       │   │       ├── SortableContext (vertical cards)
│       │   │       │   └── SortableCard[]
│       │   │       │       └── CardPreview
│       │   │       │           └── CardDetailsDrawer (vaul)
│       │   │       └── Add Card Button → NewCardDialog
│       │   └── Add Column Panel → NewColumnDialog
│       └── DragOverlay
│           ├── Column (when dragging column)
│           └── CardPreview (when dragging card)
└── WorkeSpaceEmpty (when no active project)
```

### Data Pipeline

```
User Input → UI Components → Zustand Actions → Store Update → localStorage (debounced 500ms)
                                    ↓
                              React Re-renders (selective via selectors)
                                    ↓
                              UI Updates (optimistic)
```

### Drag & Drop Flow

```
Drag Start
    ↓
handleDragStart → Sets activeColumn/activeCard refs
    ↓
Drag Over (real-time)
    ↓
handleDragOver → rectIntersection collision detection
    ↓
Finds activeCol & overCol → moveCardBetweenColumns (immediate)
    ↓
Drag End
    ↓
handleDragEnd
    ├── Column reorder? → reorderColumns
    └── Card same-column reorder? → reorderCards
        (Cross-column already handled in Drag Over)
```

---

## Kanban State Blueprint

### TypeScript Interfaces

```typescript
// store/projectStore.ts

interface Task {
  text: string;
  done: boolean;
}

interface Card {
  id: string;
  title: string;
  description?: string;
  color: string;           // OKLCH from COLUMN_COLORS
  isDone: boolean;         // Full card completion toggle
  tasks: Task[];
}

interface Column {
  id: string;
  title: string;
  color: string;           // OKLCH from COLUMN_COLORS
  cards: Card[];
}

interface Project {
  id: string;
  name: string;
  columns: Column[];
}

// Import schema (no IDs - generated on import)
interface ImportData {
  name: string;
  columns: {
    title: string;
    color: string;
    cards: {
      title: string;
      description?: string;
      color: string;
      isDone?: boolean;
      tasks: { text: string; done: boolean }[];
    }[];
  }[];
}
```

### Approved Color Palette (OKLCH)

All colors must match exactly — used in both UI picker and AI prompt:

| Name | OKLCH Value |
|------|-------------|
| red | `oklch(0.72 0.16 25)` |
| orange | `oklch(0.72 0.16 55)` |
| yellow | `oklch(0.72 0.14 85)` |
| green | `oklch(0.72 0.16 145)` |
| blue | `oklch(0.72 0.16 250)` |
| purple | `oklch(0.72 0.16 310)` |
| teal | `oklch(0.72 0.16 180)` |

Defined in: `lib/column-colors.ts` → `COLUMN_COLORS` array

---

## UI/UX & Integration Patterns

### Text-to-Kanban Parser (Import)

**Location**: `AIToolsModal.tsx:50-84`

```typescript
// 1. Extract JSON from pasted text (handles markdown fences)
const jsonMatch = importText.match(/\{[\s\S]*\}/)

// 2. Parse
const data = JSON.parse(jsonMatch[0])

// 3. Validate required fields
if (!data.name || !Array.isArray(data.columns)) → error

// 4. Import (generates IDs)
importProject(data)
```

**ID Generation** (`projectStore.ts:193-194`):
```typescript
const genId = (prefix) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
// e.g., "proj-1703123456789-abc12", "col-1703123456790-def34", "card-1703123456791-ghi56"
```

### Chat-to-Kanban State Transitions

#### Start Fresh → Import
1. User clicks "Canvas Tools" in Topbar
2. Opens `AIToolsModal` → "Start Fresh" tab
3. Reads Creator Prompt (from `lib/prompts.ts`)
4. Copies prompt → pastes into ChatGPT/Claude
5. AI responds with JSON block prefixed by: `"You can copy the code below to Chat2Canvas:"`
6. User copies JSON → switches to "Import" tab → pastes
7. Import validates & creates project → sets as active

#### Export → Iterate
1. User clicks "Export" tab
2. `handleCopyProgress` strips IDs, formats JSON
3. Prepends context message: `Here is my current project progress for "X":\n\n{json}\n\nPlease suggest improvements...`
4. User pastes into AI chat → AI returns refined JSON
5. User imports refined JSON (replaces or creates new project)

### Drag Data Attachment

**Column** (`Column.tsx:47-53`):
```typescript
useSortable({
  id: col.id,
  data: { type: "Column", col }
})
```

**Card** (`SortableCard.tsx:27-33`):
```typescript
useSortable({
  id: card.id,
  data: { type: "Card", card }
})
```

**Detection** (`page.tsx:100-106`):
```typescript
const data = active.data.current
if (data.type === "Column") setActiveColumn(data.col)
if (data.type === "Card") setActiveCard(data.card)
```

### Cross-Column Move Detection

**Logic** (`page.tsx:108-141`):
```typescript
handleDragOver = (event) => {
  const { active, over } = event
  
  // Only handle Card → Column/Card drops
  if (active.data.current?.type !== "Card") return
  
  // Find source column containing active card
  const activeCol = activeProject.columns.find(c => 
    c.cards.some(card => card.id === active.id)
  )
  
  // Determine target column
  const overCol = over.data.current?.type === "Column"
    ? activeProject.columns.find(c => c.id === over.id)
    : activeProject.columns.find(c => c.cards.some(card => card.id === over.id))
  
  // Different column? Move immediately
  if (activeCol.id !== overCol.id) {
    const insertIndex = over.data.current?.type === "Card"
      ? overCol.cards.findIndex(c => c.id === over.id)
      : overCol.cards.length
    moveCardBetweenColumns(activeProject.id, active.id, activeCol.id, overCol.id, insertIndex)
  }
}
```

---

## Key Implementation Details

### Debounced Persistence

**Storage Middleware** (`projectStore.ts:440-454`):
```typescript
storage: createJSONStorage(() => {
  let saveTimeout: ReturnType<typeof setTimeout>
  return {
    getItem: (name) => localStorage.getItem(name),
    setItem: (name, value) => {
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => localStorage.setItem(name, value), 500)
    },
    removeItem: (name) => localStorage.removeItem(name),
  }
})
```

### Partial State Persistence

**Partialize** (`projectStore.ts:455-458`):
```typescript
partialize: (state) => ({
  projects: state.projects,
  activeProjectId: state.activeProjectId,
})
```

### Selective Zustand Subscriptions

Components use selector functions to avoid unnecessary re-renders:

```typescript
// Page-level
const activeProjectId = useProjectStore((state) => state.activeProjectId)
const activeProject = useProjectStore((state) =>
  state.projects.find(p => p.id === state.activeProjectId)
)

// Column-level
const deleteColumn = useProjectStore((state) => state.deleteColumn)

// Card-level (in CardDetailsDrawer)
const editCard = useProjectStore((state) => state.editCard)
const toggleTask = useProjectStore((state) => state.toggleTask)
```

### Memoization Strategy

- `Column` — `React.memo` (prevents re-render when sibling columns change)
- `SortableCard` — `React.memo` (wraps CardPreview)
- `CardPreview` — `React.memo` (renders card preview, opens Drawer)

### Accessibility Patterns

- **Keyboard navigation**: All interactive elements have `tabIndex`, `onKeyDown` handlers
- **ARIA labels**: Buttons with icons have `aria-label`
- **Focus management**: `autoFocus` on dialog inputs, `focus-visible` rings
- **Screen readers**: `sr-only` headers in Drawers, proper `role="button"`
- **Radix primitives**: Dialog, Drawer, DropdownMenu, AlertDialog, Tabs — all accessible by default

---

## File Reference Map

| Feature | Primary Files |
|---------|---------------|
| Project CRUD | `store/projectStore.ts`, `Sidebar.tsx`, `NewProjectDialog.tsx`, `EditProjectDialog.tsx` |
| Column CRUD | `Column.tsx`, `NewColumnDialog.tsx`, `EditColumnDialog.tsx` |
| Card CRUD | `CardPreview.tsx`, `CardDetailsDrawer.tsx`, `NewCardDialog.tsx`, `EditCardDialog.tsx` |
| Task Management | `CardDetailsDrawer.tsx`, `CardPreview.tsx`, `store/projectStore.ts` |
| Drag & Drop | `app/page.tsx`, `Column.tsx`, `SortableCard.tsx` |
| AI Import/Export | `AIToolsModal.tsx`, `lib/prompts.ts`, `store/projectStore.ts` |
| Theming/Dark Mode | `app/globals.css`, `app/layout.tsx`, `Sidebar.tsx` |
| Color System | `lib/column-colors.ts`, all dialogs with color pickers |