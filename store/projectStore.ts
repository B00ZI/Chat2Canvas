import { create, StateCreator } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { arrayMove } from "@dnd-kit/sortable";
import {
  Task,
  Card,
  Column,
  Project,
  ImportData,
} from "@/lib/types";

export type { Task, Card, Column, Project, ImportData };

// Set to false to restore full functionality
export const TEST_MODE = true;
// Drags run on local React state; Zustand touched once at drop (skipped while TEST_MODE)
export const LOCAL_DRAG_MODE = true;

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  // ❌ Removed syncProjectNumbers since numbering is no longer used
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

  addCard: (
    projectId: string,
    colId: string,
    cardData: Omit<Card, "id">, // ❌ Removed "number" omission
  ) => void;

  editCard: (
    projectId: string,
    columnId: string,
    cardId: string,
    updates: Partial<Card>,
  ) => void;

  deleteCard: (projectId: string, columnId: string, cardId: string) => void;

  toggleTask: (
    projectId: string,
    columnId: string,
    cardId: string,
    taskIndex: number,
  ) => void;

  toggleCardIsDone: ( // ✅ Added action to toggle full card done/undone
    projectId: string,
    columnId: string,
    cardId: string
  ) => void;

  reorderCards: (
    projectId: string,
    columnId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;

  reorderColumns: (
    projectId: string,
    oldIndex: number,
    newIndex: number,
  ) => void;

  moveCardBetweenColumns: (
    projectId: string,
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    insertIndex?: number,
  ) => void;

  replaceProjectColumns: (projectId: string, columns: Column[]) => void;
}

const storeBody: StateCreator<ProjectStore> = (set) => ({
      projects:[
        {
          id: "demo-proj",
          name: "Demo Project",
          columns: [
            {
              id: "demo-col-1",
              title: "To Do",
              color: "#f1f5f9",
              cards: [
                {
                  id: "demo-card-1",
                  title: "Design landing page",
                  description: "Create wireframes and high-fidelity mockups for the new landing page",
                  color: "#dbeafe",
                  isDone: false,
                  tasks: [
                    { text: "Research competitor layouts", done: true },
                    { text: "Create wireframes", done: true },
                    { text: "Design high-fidelity mockups", done: false },
                    { text: "Get stakeholder approval", done: false },
                  ],
                },
                {
                  id: "demo-card-2",
                  title: "Set up CI/CD pipeline",
                  description: "",
                  color: "#e0e7ff",
                  isDone: false,
                  tasks: [
                    { text: "Configure GitHub Actions", done: false },
                    { text: "Add linting step", done: false },
                    { text: "Add test runner", done: false },
                  ],
                },
                {
                  id: "demo-card-3",
                  title: "Write API documentation",
                  description: "Document all REST endpoints with examples",
                  color: "#fce7f3",
                  isDone: false,
                  tasks: [
                    { text: "Document auth endpoints", done: false },
                    { text: "Document user endpoints", done: false },
                    { text: "Add request/response examples", done: false },
                  ],
                },
              ],
            },
            {
              id: "demo-col-2",
              title: "In Progress",
              color: "#e0f2fe",
              cards: [
                {
                  id: "demo-card-4",
                  title: "Implement user authentication",
                  description: "JWT-based auth with refresh tokens",
                  color: "#cffafe",
                  isDone: false,
                  tasks: [
                    { text: "Set up JWT library", done: true },
                    { text: "Create login endpoint", done: true },
                    { text: "Create register endpoint", done: true },
                    { text: "Add refresh token flow", done: false },
                    { text: "Write integration tests", done: false },
                  ],
                },
                {
                  id: "demo-card-5",
                  title: "Database schema migration",
                  description: "",
                  color: "#a5f3fc",
                  isDone: false,
                  tasks: [
                    { text: "Design new tables", done: true },
                    { text: "Write migration scripts", done: false },
                    { text: "Test rollback", done: false },
                  ],
                },
              ],
            },
            {
              id: "demo-col-3",
              title: "Review",
              color: "#fef3c7",
              cards: [
                {
                  id: "demo-card-6",
                  title: "Performance audit",
                  description: "Lighthouse audit and bundle analysis",
                  color: "#fef9c3",
                  isDone: false,
                  tasks: [
                    { text: "Run Lighthouse", done: true },
                    { text: "Analyze bundle size", done: true },
                    { text: "Optimize images", done: true },
                    { text: "Write up findings", done: false },
                  ],
                },
              ],
            },
            {
              id: "demo-col-4",
              title: "Done",
              color: "#dcfce7",
              cards: [
                {
                  id: "demo-card-7",
                  title: "Project setup",
                  description: "Initialize repo with Next.js, Tailwind, and ESLint",
                  color: "#d1fae5",
                  isDone: true,
                  tasks: [
                    { text: "Create Next.js app", done: true },
                    { text: "Install Tailwind CSS", done: true },
                    { text: "Configure ESLint", done: true },
                    { text: "Set up folder structure", done: true },
                  ],
                },
                {
                  id: "demo-card-8",
                  title: "Component library",
                  description: "Set up shadcn/ui with base components",
                  color: "#bbf7d0",
                  isDone: true,
                  tasks: [
                    { text: "Install shadcn/ui", done: true },
                    { text: "Add Button, Dialog, Input", done: true },
                    { text: "Configure theme", done: true },
                  ],
                },
              ],
            },
          ],
        },
      ],
      activeProjectId: "demo-proj",

      reorderColumns: (projectId, oldIndex, newIndex) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, columns: arrayMove(p.columns, oldIndex, newIndex) }
              : p,
          ),
        }));
      },

      reorderCards: (projectId, columnId, oldIndex, newIndex) => {
        set((state) => {
          const pIdx = state.projects.findIndex((p) => p.id === projectId);
          if (pIdx === -1) return state;
          const newProjects =[...state.projects];

          newProjects[pIdx] = {
            ...newProjects[pIdx],
            columns: newProjects[pIdx].columns.map((col) =>
              col.id === columnId
                ? {
                    ...col,
                    // ❌ Removed the .map((c, i) => ({ ...c, number: i + 1 })) logic
                    cards: arrayMove(col.cards, oldIndex, newIndex),
                  }
                : col,
            ),
          };

          return { projects: newProjects };
        });
      },

      moveCardBetweenColumns: (projectId, cardId, fromId, toId, idx) => {
        set((state) => {
          const pIdx = state.projects.findIndex((p) => p.id === projectId);
          if (pIdx === -1) return state;

          const proj = state.projects[pIdx];
          const colMap = new Map(proj.columns.map(c => [c.id, c]));
          const sCol = colMap.get(fromId);
          const tCol = colMap.get(toId);
          if (!sCol || !tCol) return state;

          const cardIdx = sCol.cards.findIndex((c) => c.id === cardId);
          if (cardIdx === -1) return state;
          const card = sCol.cards[cardIdx];

          const newCols = proj.columns.map((col) => {
            if (col.id === fromId) {
              const newCards = [...col.cards];
              newCards.splice(cardIdx, 1);
              return { ...col, cards: newCards };
            }
            if (col.id === toId) {
              const newCards = [...col.cards];
              const insertAt = typeof idx === "number" && idx >= 0 ? idx : newCards.length;
              newCards.splice(insertAt, 0, card);
              return { ...col, cards: newCards };
            }
            return col;
          });

          const newProjects = [...state.projects];
          newProjects[pIdx] = { ...proj, columns: newCols };
          return { projects: newProjects };
        });
      },

      replaceProjectColumns: (projectId, columns) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, columns } : p,
          ),
        }));
      },

      importProject: (data) => {
        const genId = (p: string) =>
          `${p}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const newP: Project = {
          id: genId("proj"),
          name: data.name,
          columns: data.columns.map((col) => ({
            id: genId("col"),
            title: col.title,
            color: col.color,
            cards: col.cards.map((c) => ({
              id: genId("card"),
              title: c.title,
              description: c.description || "", // ✅ Handle imported description
              color: c.color,
              isDone: c.isDone || false, // ✅ Handle imported isDone
              tasks: c.tasks,
            })), // ❌ Removed index/number assignment
          })),
        };

        set((state) => ({
          projects:[...state.projects, newP],
          activeProjectId: newP.id,
        }));
      },

      addProject: (name) => {
        const genId = (p: string) => `${p}-${Date.now()}`;
        const newP: Project = {
          id: genId("proj"),
          name,
          columns:[
            {
              id: genId("col-todo"),
              title: "To Do",
              color: "#f1f5f9",
              cards: [],
            },
            {
              id: genId("col-prog"),
              title: "In Progress",
              color: "#e0f2fe",
              cards:[],
            },
            {
              id: genId("col-done"),
              title: "Done",
              color: "#dcfce7",
              cards:[],
            },
          ],
        };

        set((state) => ({
          projects: [...state.projects, newP],
          activeProjectId: newP.id,
        }));
      },

      editProject: (id, newName) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name: newName } : p,
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => {
          const nP = state.projects.filter((p) => p.id !== id);
          return {
            projects: nP,
            activeProjectId:
              state.activeProjectId === id
                ? nP[0]?.id || null
                : state.activeProjectId,
          };
        });
      },

      setActiveProject: (id) => set({ activeProjectId: id }),

      addColumn: (pId, title, color) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === pId
              ? {
                  ...p,
                  columns:[
                    ...p.columns,
                    {
                      id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                      title,
                      color,
                      cards: [],
                    },
                  ],
                }
              : p,
          ),
        }));
      },

      deleteColumn: (pId, cId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === pId
              ? { ...p, columns: p.columns.filter((c) => c.id !== cId) }
              : p,
          ),
        }));
      },

      editColumn: (pId, cId, upd) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === pId
              ? {
                  ...p,
                  columns: p.columns.map((c) =>
                    c.id === cId ? { ...c, ...upd } : c,
                  ),
                }
              : p,
          ),
        }));
      },

      addCard: (pId, cId, data) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === pId
              ? {
                  ...p,
                  columns: p.columns.map((col) =>
                    col.id === cId
                      ? {
                          ...col,
                          cards:[
                            ...col.cards,
                            {
                              ...data, // ✅ data now naturally includes description and isDone
                              id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                            }, // ❌ Removed number assignment
                          ],
                        }
                      : col,
                  ),
                }
              : p,
          ),
        }));
      },

      editCard: (pId, cId, cardId, upd) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === pId
              ? {
                  ...p,
                  columns: p.columns.map((col) =>
                    col.id === cId
                      ? {
                          ...col,
                          cards: col.cards.map((c) =>
                            c.id === cardId ? { ...c, ...upd } : c,
                          ),
                        }
                      : col,
                  ),
                }
              : p,
          ),
        }));
      },

      deleteCard: (pId, cId, cardId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === pId
              ? {
                  ...p,
                  columns: p.columns.map((col) =>
                    col.id === cId
                      ? {
                          ...col,
                          // ❌ Removed re-numbering logic
                          cards: col.cards.filter((c) => c.id !== cardId),
                        }
                      : col,
                  ),
                }
              : p,
          ),
        }));
      },

      toggleTask: (pId, cId, cardId, tIdx) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === pId
              ? {
                  ...p,
                  columns: p.columns.map((col) =>
                    col.id === cId
                      ? {
                          ...col,
                          cards: col.cards.map((c) => {
                            if (c.id !== cardId) return c;
                            const nT = [...c.tasks];
                            if (nT[tIdx])
                              nT[tIdx] = { ...nT[tIdx], done: !nT[tIdx].done };
                            return { ...c, tasks: nT };
                          }),
                        }
                      : col,
                  ),
                }
              : p,
          ),
        }));
      },

      // ✅ New action to toggle a card's completion status
      toggleCardIsDone: (pId, cId, cardId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === pId
              ? {
                  ...p,
                  columns: p.columns.map((col) =>
                    col.id === cId
                      ? {
                          ...col,
                          cards: col.cards.map((c) =>
                            c.id === cardId ? { ...c, isDone: !c.isDone } : c
                          ),
                        }
                      : col,
                  ),
                }
              : p,
          ),
        }));
      },
});

export const useProjectStore = TEST_MODE
  ? create<ProjectStore>()(storeBody)
  : create<ProjectStore>()(
      persist(storeBody, {
        name: "chat2canvas-storage",
        skipHydration: true,
        storage: createJSONStorage(() => {
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
      }),
    );