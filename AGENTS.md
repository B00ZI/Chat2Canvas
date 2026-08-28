# Chat2Canvas - Agent Knowledge Base

## Executive Project Overview

**Chat2Canvas** is a Kanban-style visual project planner that bridges AI chat conversations (ChatGPT, Claude) with structured task management. Users describe projects in natural language to an AI, copy a specialized "Creator Prompt" to generate structured JSON, then import that JSON into Chat2Canvas to instantly create a visual Kanban board with columns, cards, and subtasks.

### Primary User Flows

1. **Create Project Manually**: Sidebar → "New Project" → creates project with default To Do/In Progress/Done columns
2. **AI-Assisted Creation**: Topbar → "Canvas Tools" → "Start Fresh" tab → Copy Creator Prompt → Paste into AI chat → AI returns JSON → "Import" tab → Paste JSON → Project created
3. **Iterate with AI**: Export current project state → Paste into AI chat for refinements → Import updated JSON
4. **Kanban Management**: Drag-and-drop columns/cards, edit details, track task completion, mark cards done

---

## Technology Stack Breakdown

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 16.1.6 | App Router, React Server Components (RSC) |
| **Runtime** | React | 19.2.3 | UI library |
| **Language** | TypeScript | 5.x | Type safety |
| **State Management** | Zustand | 5.0.11 | Global store with localStorage persistence |
| **Drag & Drop** | @dnd-kit/core, @dnd-kit/sortable, @dnd-kit/utilities | 6.3.1, 10.0.0, 3.2.2 | Column/card reordering, cross-column moves |
| **UI Components** | Radix UI / shadcn/ui | Latest | Accessible primitives (Dialog, Drawer, Dropdown, Tabs, etc.) |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS with CSS variables |
| **Icons** | Lucide React | 0.563.0 | Icon library |
| **Utilities** | clsx, tailwind-merge, class-variance-authority | Latest | Class name composition |
| **Animation** | vaul | 1.1.2 | Drawer animations |
| **Linting** | ESLint | 9.x | Code quality with Next.js config |

---

## Directory Map & Module Breakdown

```
Chat2Canvas/
├── app/
│   ├── layout.tsx          # Root layout with Sidebar, font loading, dark mode
│   ├── page.tsx            # Main Kanban board (DndContext, columns, drag handlers)
│   └── globals.css         # Tailwind v4 theme, CSS variables, dark mode, fonts
├── components/
│   ├── ui/                 # shadcn/ui primitives (Button, Dialog, Drawer, etc.)
│   ├── Column.tsx          # Column container with SortableContext for cards
│   ├── SortableCard.tsx    # @dnd-kit wrapper for CardPreview
│   ├── CardPreview.tsx     # Card display (title, description, tasks, done toggle)
│   ├── CardDetailsDrawer.tsx # Full card editor (title, desc, color, tasks, progress)
│   ├── Card.tsx            # Legacy card component (still used? check imports)
│   ├── Sidebar.tsx         # Project list, search, new/edit/delete project dialogs
│   ├── Topbar.tsx          # Project header, progress %, AI Tools button
│   ├── AIToolsModal.tsx    # 3-tab modal: Start Fresh / Import / Export
│   ├── NewProjectDialog.tsx
│   ├── EditProjectDialog.tsx
│   ├── NewColumnDialog.tsx
│   ├── EditColumnDialog.tsx
│   ├── NewCardDialog.tsx
│   ├── ConfirmDeleteDialog.tsx
│   ├── CardPreview.tsx
│   └── WorkspaceEmpty.tsx # Empty state with "Canvas Tools" / "Create manually"
├── store/
│   └── projectStore.ts     # Zustand store: projects, columns, cards, tasks, actions
├── lib/
│   ├── prompts.ts          # AI Creator Prompt (system instructions for JSON format)
│   ├── column-colors.ts    # 8 approved OKLCH colors for columns/cards
│   └── utils.ts            # cn() helper for class merging
├── components.json         # shadcn/ui config (new-york style, slate base, lucide icons)
├── tsconfig.json           # Strict TS, path aliases (@/*)
├── next.config.ts          # Minimal Next.js config
└── package.json
```

---

## Core Architecture & Data Flow

### State Management (Zustand + localStorage)

**Store Location**: `store/projectStore.ts`

**Persisted State** (debounced 500ms writes):
```typescript
{
  projects: Project[],
  activeProjectId: string | null
}
```

**Project Schema**:
```typescript
interface Project {
  id: string;
  name: string;
  columns: Column[];
}

interface Column {
  id: string;
  title: string;
  color: string;        // OKLCH from approved palette
  cards: Card[];
}

interface Card {
  id: string;
  title: string;
  description?: string;
  color: string;        // OKLCH from approved palette
  isDone: boolean;      // Full card completion
  tasks: Task[];
}

interface Task {
  text: string;
  done: boolean;
}
```

**Key Actions**:
- `addProject(name)` — Creates project with 3 default columns
- `importProject(data)` — Parses AI JSON, generates IDs, sets as active
- `replaceProjectColumns(projectId, columns)` — Single write path for the drag system; UI commits the final board once, on drop
- `toggleCardIsDone(projectId, columnId, cardId)` — Marks entire card complete
- `toggleTask(projectId, columnId, cardId, taskIndex)` — Toggles subtask

### Drag & Drop Architecture (@dnd-kit)

**Two-Level SortableContext**:
1. **Horizontal** (page.tsx): `SortableContext` with `horizontalListSortingStrategy` for column reordering
2. **Vertical** (Column.tsx): Nested `SortableContext` with `verticalListSortingStrategy` per column

**Local drag board** (page.tsx): on first grab, store columns are snapshotted into local React state (`boardOv`); all rendering during drags comes from that copy so Zustand/localStorage are never touched mid-drag.

**Drag Over Logic**:
- `handleDragOver` records only the card's intended destination (`pendingMoveRef`) and updates the "Drop here" indicator state — zero state commits during drag

**Drag End Logic**:
- Applies cross-column move + column/card reorder to the local board in one pass
- TEST_MODE: result stays in local state for the session
- Otherwise: exactly ONE `replaceProjectColumns` write, then control returns to the store

### Chat-to-Kanban (AI Integration)

**Creator Prompt** (`lib/prompts.ts`):
- System prompt instructing AI to output specific JSON format
- 8 approved OKLCH colors (no hex, no names)
- Required fields: `name`, `columns[]` with `title`, `color`, `cards[]` with `title`, `color`, `tasks[]`

**Import Flow** (AIToolsModal.tsx:50-84):
1. User pastes text (may contain markdown/code fences)
2. Regex extracts first `{...}` JSON block
3. Validates `name` and `columns` array
4. Calls `importProject(data)` → generates IDs via `genId(prefix)`
5. Sets as active project

**Export Flow** (AIToolsModal.tsx:87-108):
1. Strips IDs from current project
2. Formats as clean JSON
3. Prepends context message for AI continuation
4. Copies to clipboard

### UI/UX Patterns

- **shadcn/ui "new-york" style** with CSS variables for theming
- **Dark mode** via `.dark` class on `<html>` (controlled by Sidebar toggle)
- **Drawer** (vaul) for card details — mobile-friendly bottom sheet
- **Dropdown menus** for column/card actions (edit, delete)
- **Optimistic updates** — all mutations immediate, persisted async
- **Color palette** — 8 OKLCH colors enforced at UI and AI-prompt level

---

## Local Development & Build Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

**Environment**: No `.env` required — fully client-side with localStorage.

---

## Coding Standards & Conventions

1. **'use client'** directive on all interactive components
2. **Path aliases**: `@/*` maps to project root
3. **Component structure**: Exported as default or named, with TypeScript interfaces
4. **State selection**: Use Zustand selector functions for granular subscriptions
5. **Drag data**: Attach `{ type: "Column" | "Card", col?: Column, card?: Card }` to `useSortable` data
6. **Color usage**: Only approved OKLCH colors from `COLUMN_COLORS`
7. **ID generation**: `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`
8. **Debounced persistence**: 500ms timeout in storage middleware
9. **Memoization**: `React.memo` on Column, SortableCard, CardPreview
10. **Accessibility**: Radix primitives, proper ARIA labels, keyboard navigation