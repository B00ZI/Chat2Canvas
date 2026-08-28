import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Card, Column, ImportData, Project, Tag } from "@/lib/types";
import { COLUMN_COLORS } from "@/lib/column-colors";
import { LEGACY_COLOR_MAP } from "@/lib/column-colors";
import { DEMO_PROJECTS } from "./demoData";

/** Sanitize AI/user-provided tags onto the content palette. */
function sanitizeTags(raw: unknown): Tag[] {
  const palette: string[] = COLUMN_COLORS.map((c) => c.value as string);
  const seen = new Set<string>();
  const out: Tag[] = [];
  for (const item of Array.isArray(raw) ? raw : []) {
    const name = String((item as Tag)?.name ?? "")
      .trim()
      .slice(0, 12);
    if (!name) continue;
    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const color = (item as Tag)?.color;
    out.push({
      name,
      color:
        typeof color === "string" && palette.includes(color)
          ? color
          : FALLBACK_COLOR,
    });
    if (out.length >= 4) break;
  }
  return out;
}

/**
 * When true, persistence is swapped for a no-op adapter and the UI guards
 * its mutations, so drag/render performance can be tested in isolation.
 * Flip to false to reconnect localStorage.
 */
export const TEST_MODE = false;

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;

  /** Transient UI state — which card's drawer is open. Never persisted. */
  openCard: { colId: string; cardId: string } | null;
  setOpenCard: (open: { colId: string; cardId: string } | null) => void;

  /** Transient search query for filtering cards across columns. */
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  importProject: (projectData: ImportData) => void;
  updateProjectFromImport: (
    projectId: string,
    projectData: ImportData,
  ) => void;
  addProject: (name: string) => void;
  editProject: (id: string, newName: string) => void;
  setProjectDescription: (id: string, description: string) => void;
  deleteProject: (id: string) => void;
  restoreProject: (project: Project) => void;
  setActiveProject: (id: string | null) => void;

  addColumn: (projectId: string, title: string, color: string) => void;
  deleteColumn: (projectId: string, columnId: string) => void;
  restoreColumn: (projectId: string, column: Column) => void;
  editColumn: (
    projectId: string,
    columnId: string,
    updates: Partial<Column>,
  ) => void;
  replaceProjectColumns: (projectId: string, columns: Column[]) => void;

  addCard: (
    projectId: string,
    colId: string,
    cardData: Omit<Card, "id">,
  ) => void;
  editCard: (
    projectId: string,
    colId: string,
    cardId: string,
    updates: Partial<Card>,
  ) => void;
  deleteCard: (projectId: string, colId: string, cardId: string) => void;
  restoreCard: (projectId: string, colId: string, card: Card) => void;
  toggleTask: (
    projectId: string,
    colId: string,
    cardId: string,
    taskIndex: number,
  ) => void;
  toggleCardIsDone: (projectId: string, colId: string, cardId: string) => void;
  addTag: (projectId: string, colId: string, cardId: string, tag: Tag) => void;
  removeTag: (
    projectId: string,
    colId: string,
    cardId: string,
    tagIndex: number,
  ) => void;
}

/** Collision-safe id: "<prefix>-<timestamp>-<random>" */
const genId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

/** Only allow colors from the approved palette — rejects arbitrary CSS. */
const PALETTE_SET = new Set<string>(COLUMN_COLORS.map((c) => c.value));
const FALLBACK_COLOR = COLUMN_COLORS[7].value as string;
function safeColor(raw: string): string {
  if (PALETTE_SET.has(raw)) return raw;
  const mapped = LEGACY_COLOR_MAP[raw];
  return mapped && PALETTE_SET.has(mapped) ? mapped : FALLBACK_COLOR;
}

/** Immutably replace one column's cards array. Shared by all card actions. */
function mapCardsIn(
  projects: Project[],
  projectId: string,
  colId: string,
  fn: (cards: Card[]) => Card[],
): Project[] {
  return projects.map((p) =>
    p.id !== projectId
      ? p
      : {
          ...p,
          columns: p.columns.map((col) =>
            col.id !== colId ? col : { ...col, cards: fn(col.cards) },
          ),
        },
  );
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: DEMO_PROJECTS,
      activeProjectId: DEMO_PROJECTS[0].id,

      // ── Transient UI state ─────────────────────────────────────────

      openCard: null,
      setOpenCard: (open) => set({ openCard: open }),

      searchQuery: "",
      setSearchQuery: (query) => set({ searchQuery: query }),

      // ── Projects ──────────────────────────────────────────────────

      importProject: (data) => {
        if (!data.columns || !Array.isArray(data.columns)) return;
        const newProject: Project = {
          id: genId("proj"),
          name: (data.name || "Untitled").slice(0, 100),
          description:
            typeof data.description === "string"
              ? data.description.slice(0, 500)
              : "",
          createdAt: Date.now(),
          columns: data.columns.map((col) => ({
            id: genId("col"),
            title: (col.title || "Untitled").slice(0, 60),
            color: safeColor(col.color),
            cards: (col.cards || []).map((c) => ({
              id: genId("card"),
              title: (c.title || "Untitled").slice(0, 120),
              description: (c.description || "").slice(0, 500),
              color: safeColor(c.color),
              isDone: c.isDone || false,
              tasks: Array.isArray(c.tasks) ? c.tasks : [],
              tags: sanitizeTags(c.tags),
            })),
          })),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));
      },

      /** Refine flow: swap an existing project's sections/cards in place,
       *  keeping its identity (id, name, description, createdAt). */
      updateProjectFromImport: (projectId, data) => {
        if (!data.columns || !Array.isArray(data.columns)) return;
        return set((state) => ({
          openCard: null,
          projects: state.projects.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
                  columns: data.columns.map((col) => ({
                    id: genId("col"),
                    title: (col.title || "Untitled").slice(0, 60),
                    color: safeColor(col.color),
                    cards: (col.cards || []).map((c) => ({
                      id: genId("card"),
                      title: (c.title || "Untitled").slice(0, 120),
                      description: (c.description || "").slice(0, 500),
                      color: safeColor(c.color),
                      isDone: c.isDone || false,
                      tasks: Array.isArray(c.tasks) ? c.tasks : [],
                      tags: sanitizeTags(c.tags),
                    })),
                  })),
                }
          ),
        }))},

      addProject: (name) => {
        const newProject: Project = {
          id: genId("proj"),
          name,
          description: "",
          createdAt: Date.now(),
          columns: [
            { id: genId("col"), title: "To Do", color: COLUMN_COLORS[4].value, cards: [] },
            { id: genId("col"), title: "In Progress", color: COLUMN_COLORS[1].value, cards: [] },
            { id: genId("col"), title: "Done", color: COLUMN_COLORS[2].value, cards: [] },
          ],
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));
      },

      editProject: (id, newName) => {
        const trimmed = newName.trim();
        if (!trimmed) return;
        return set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name: trimmed } : p,
          ),
        }));
      },

      setProjectDescription: (id, description) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id
              ? { ...p, description: description.trim().slice(0, 500) }
              : p,
          ),
        })),

      deleteProject: (id) =>
        set((state) => {
          const remaining = state.projects.filter((p) => p.id !== id);
          return {
            projects: remaining,
            activeProjectId:
              state.activeProjectId === id
                ? remaining[0]?.id ?? null
                : state.activeProjectId,
          };
        }),

      restoreProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      setActiveProject: (id: string | null) => set({ activeProjectId: id }),

      // ── Columns ───────────────────────────────────────────────────

      // Single write path used by the drag system: the UI keeps a local
      // board during a drag and commits the final layout once, on drop.
      replaceProjectColumns: (projectId, columns) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, columns } : p,
          ),
        })),

      addColumn: (projectId, title, color) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  columns: [
                    ...p.columns,
                    { id: genId("col"), title, color, cards: [] },
                  ],
                }
              : p,
          ),
        })),

      deleteColumn: (projectId, columnId) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, columns: p.columns.filter((c) => c.id !== columnId) }
              : p,
          ),
          openCard:
            state.openCard?.colId === columnId ? null : state.openCard,
        })),

      restoreColumn: (projectId, column) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, columns: [...p.columns, column] }
              : p,
          ),
        })),

      editColumn: (projectId, columnId, updates) => {
        const { id: _id, cards: _cards, ...safe } = updates as Record<string, unknown>;
        return set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  columns: p.columns.map((c) =>
                    c.id === columnId ? { ...c, ...safe } : c,
                  ),
                }
              : p,
          ),
        }));
      },

      // ── Cards ─────────────────────────────────────────────────────

      addCard: (projectId, colId, cardData) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) => [
            ...cards,
            { ...cardData, id: genId("card") },
          ]),
        })),

      editCard: (projectId, colId, cardId, updates) => {
        const { id: _id, ...safe } = updates as Record<string, unknown>;
        return set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) =>
            cards.map((c) => (c.id === cardId ? { ...c, ...safe } : c)),
          ),
        }));
      },

      deleteCard: (projectId, colId, cardId) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) =>
            cards.filter((c) => c.id !== cardId),
          ),
          openCard:
            state.openCard?.cardId === cardId ? null : state.openCard,
        })),

      restoreCard: (projectId, colId, card) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) => [
            ...cards,
            card,
          ]),
        })),

      toggleTask: (projectId, colId, cardId, taskIndex) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) =>
            cards.map((c) => {
              if (c.id !== cardId || !c.tasks[taskIndex]) return c;
              const tasks = [...c.tasks];
              tasks[taskIndex] = {
                ...tasks[taskIndex],
                done: !tasks[taskIndex].done,
              };
              return { ...c, tasks };
            }),
          ),
        })),

      toggleCardIsDone: (projectId, colId, cardId) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) =>
            cards.map((c) =>
              c.id === cardId ? { ...c, isDone: !c.isDone } : c,
            ),
          ),
        })),

      addTag: (projectId, colId, cardId, tag) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) =>
            cards.map((c) => {
              if (c.id !== cardId) return c;
              // Replace same-name tag, cap at 4
              const tags = (c.tags ?? []).filter(
                (t) => t.name.toLowerCase() !== tag.name.toLowerCase(),
              );
              return { ...c, tags: [...tags, tag].slice(0, 4) };
            }),
          ),
        })),

      removeTag: (projectId, colId, cardId, tagIndex) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) =>
            cards.map((c) =>
              c.id === cardId
                ? {
                    ...c,
                    tags: (c.tags ?? []).filter((_, i) => i !== tagIndex),
                  }
                : c,
            ),
          ),
        })),
    }),
    {
      name: "chat2canvas-storage",
      version: 2,
      // v0→v1: snap legacy colors onto the current palette.
      // v1→v2: backfill project createdAt for the details panel.
      migrate: (state) => {
        const s = state as {
          projects?: Project[];
          activeProjectId?: string | null;
        };
        return {
          projects: (s.projects ?? []).map((p) => ({
            ...p,
            createdAt: p.createdAt ?? Date.now(),
            columns: p.columns.map((col) => ({
              ...col,
              color: safeColor(col.color),
              cards: col.cards.map((card) => ({
                ...card,
                color: safeColor(card.color),
              })),
            })),
          })),
          activeProjectId: s.activeProjectId ?? null,
        };
      },
      skipHydration: true, // rehydrated manually after mount (app/layout.tsx)
      storage: createJSONStorage(() => {
        if (TEST_MODE) {
          // Black-hole adapter: identical store shape, zero disk I/O.
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        // Debounced writes so rapid mutations coalesce into one save.
        let saveTimeout: ReturnType<typeof setTimeout> | undefined;
        let pendingValue: string | null = null;
        let pendingName: string | null = null;

        function flushPending() {
          if (saveTimeout) clearTimeout(saveTimeout);
          saveTimeout = undefined;
          if (pendingName && pendingValue !== null) {
            try {
              localStorage.setItem(pendingName, pendingValue);
            } catch {
              // localStorage full or unavailable — warn once, then degrade
              if (typeof window !== "undefined" && !(window as unknown as Record<string, unknown>).__c2c_storageWarned) {
                (window as unknown as Record<string, unknown>).__c2c_storageWarned = true;
                window.dispatchEvent(new CustomEvent("c2c:storage-warning"));
              }
            }
            pendingValue = null;
            pendingName = null;
          }
        }

        // Flush before the tab closes so no writes are lost.
        if (typeof window !== "undefined") {
          window.addEventListener("beforeunload", flushPending);
        }

        return {
          getItem: (name) => {
            try {
              return localStorage.getItem(name);
            } catch {
              return null;
            }
          },
          setItem: (name, value) => {
            pendingName = name;
            pendingValue = value;
            if (saveTimeout) clearTimeout(saveTimeout);
            saveTimeout = setTimeout(flushPending, 500);
          },
          removeItem: (name) => {
            try {
              localStorage.removeItem(name);
            } catch {
              // silently degrade
            }
          },
        };
      }),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    },
  ),
);
