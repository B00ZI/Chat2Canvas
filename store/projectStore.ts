import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Card, Column, ImportData, Project } from "@/lib/types";
import { COLUMN_COLORS, normalizeContentColor } from "@/lib/column-colors";
import { DEMO_PROJECTS } from "./demoData";

/**
 * When true, persistence is swapped for a no-op adapter and the UI guards
 * its mutations, so drag/render performance can be tested in isolation.
 * Flip to false to reconnect localStorage.
 */
export const TEST_MODE = false;

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;

  importProject: (projectData: ImportData) => void;
  addProject: (name: string) => void;
  editProject: (id: string, newName: string) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string) => void;

  addColumn: (projectId: string, title: string, color: string) => void;
  deleteColumn: (projectId: string, columnId: string) => void;
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
  toggleTask: (
    projectId: string,
    colId: string,
    cardId: string,
    taskIndex: number,
  ) => void;
  toggleCardIsDone: (projectId: string, colId: string, cardId: string) => void;
}

/** Collision-safe id: "<prefix>-<timestamp>-<random>" */
const genId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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

      // ── Projects ──────────────────────────────────────────────────

      importProject: (data) => {
        const newProject: Project = {
          id: genId("proj"),
          name: data.name,
          columns: data.columns.map((col) => ({
            id: genId("col"),
            title: col.title,
            color: normalizeContentColor(col.color),
            cards: col.cards.map((c) => ({
              id: genId("card"),
              title: c.title,
              description: c.description || "",
              color: normalizeContentColor(c.color),
              isDone: c.isDone || false,
              tasks: c.tasks,
            })),
          })),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));
      },

      addProject: (name) => {
        const newProject: Project = {
          id: genId("proj"),
          name,
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

      editProject: (id, newName) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name: newName } : p,
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

      setActiveProject: (id) => set({ activeProjectId: id }),

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
        })),

      editColumn: (projectId, columnId, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  columns: p.columns.map((c) =>
                    c.id === columnId ? { ...c, ...updates } : c,
                  ),
                }
              : p,
          ),
        })),

      // ── Cards ─────────────────────────────────────────────────────

      addCard: (projectId, colId, cardData) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) => [
            ...cards,
            { ...cardData, id: genId("card") },
          ]),
        })),

      editCard: (projectId, colId, cardId, updates) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) =>
            cards.map((c) => (c.id === cardId ? { ...c, ...updates } : c)),
          ),
        })),

      deleteCard: (projectId, colId, cardId) =>
        set((state) => ({
          projects: mapCardsIn(state.projects, projectId, colId, (cards) =>
            cards.filter((c) => c.id !== cardId),
          ),
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
    }),
    {
      name: "chat2canvas-storage",
      version: 1,
      // v0 → v1: snap legacy colors (old OKLCH set, hex defaults) onto the
      // current content palette so the Ember accent keeps its own lane.
      migrate: (state) => {
        const s = state as {
          projects?: Project[];
          activeProjectId?: string | null;
        };
        return {
          projects: (s.projects ?? []).map((p) => ({
            ...p,
            columns: p.columns.map((col) => ({
              ...col,
              color: normalizeContentColor(col.color),
              cards: col.cards.map((card) => ({
                ...card,
                color: normalizeContentColor(card.color),
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
        return {
          getItem: (name) => localStorage.getItem(name),
          setItem: (name, value) => {
            if (saveTimeout) clearTimeout(saveTimeout);
            saveTimeout = setTimeout(() => {
              localStorage.setItem(name, value);
            }, 500);
          },
          removeItem: (name) => localStorage.removeItem(name),
        };
      }),
      partialize: (state) => ({
        projects: state.projects,
        activeProjectId: state.activeProjectId,
      }),
    },
  ),
);
