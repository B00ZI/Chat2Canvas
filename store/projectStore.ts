import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Card, Column, ImportData, Project, Tag } from "@/lib/types";
import { COLUMN_COLORS, normalizeContentColor } from "@/lib/column-colors";
import { DEMO_PROJECTS } from "./demoData";

/** Sanitize AI/user-provided tags onto the content palette. */
function sanitizeTags(raw: unknown): Tag[] {
  const palette: string[] = COLUMN_COLORS.map((c) => c.value);
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
          : COLUMN_COLORS[7].value,
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

  importProject: (projectData: ImportData) => void;
  updateProjectFromImport: (
    projectId: string,
    projectData: ImportData,
  ) => void;
  addProject: (name: string) => void;
  editProject: (id: string, newName: string) => void;
  setProjectDescription: (id: string, description: string) => void;
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

      // ── Projects ──────────────────────────────────────────────────

      importProject: (data) => {
        const newProject: Project = {
          id: genId("proj"),
          name: data.name,
          description:
            typeof data.description === "string"
              ? data.description.slice(0, 500)
              : "",
          createdAt: Date.now(),
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
      updateProjectFromImport: (projectId, data) =>
        set((state) => ({
          openCard: null,
          projects: state.projects.map((p) =>
            p.id !== projectId
              ? p
              : {
                  ...p,
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
                      tags: sanitizeTags(c.tags),
                    })),
                  })),
                }
          ),
        })),

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

      editProject: (id, newName) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name: newName } : p,
          ),
        })),

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
