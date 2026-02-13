import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { arrayMove } from "@dnd-kit/sortable";

interface Task {
  text: string;
  done: boolean;
}

interface Card {
  id: string;
  number: number;
  title: string;
  color: string;
  tasks: Task[];
}

interface Column {
  id: string;
  title: string;
  color: string;
  cards: Card[];
}

interface Project {
  id: string;
  name: string;
  columns: Column[];
}

interface ImportData {
  name: string;
  columns: {
    title: string;
    color: string;
    cards: {
      title: string;
      color: string;
      tasks: { text: string; done: boolean }[];
    }[];
  }[];
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;
  syncProjectNumbers: (projectId: string) => void;
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
    cardData: Omit<Card, "id" | "number">,
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
}

// 1️⃣ Define the debounce timer outside the store
let saveTimeout: ReturnType<typeof setTimeout> | undefined;

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,

      syncProjectNumbers: (pId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === pId
              ? {
                  ...p,
                  columns: p.columns.map((col) => ({
                    ...col,
                    cards: col.cards.map((c, i) => ({ ...c, number: i + 1 })),
                  })),
                }
              : p,
          ),
        }));
      },

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
          const newProjects = [...state.projects];

          newProjects[pIdx] = {
            ...newProjects[pIdx],
            columns: newProjects[pIdx].columns.map((col) =>
              col.id === columnId
                ? {
                    ...col,
                    cards: arrayMove(col.cards, oldIndex, newIndex).map(
                      (c, i) => ({ ...c, number: i + 1 }),
                    ),
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
          const sCol = proj.columns.find((c) => c.id === fromId);
          const tCol = proj.columns.find((c) => c.id === toId);
          const card = sCol?.cards.find((c) => c.id === cardId);
          if (!sCol || !tCol || !card) return state;

          const newCols = proj.columns.map((col) => {
            if (col.id === fromId)
              return {
                ...col,
                cards: col.cards.filter((c) => c.id !== cardId),
              };
            if (col.id === toId) {
              const newCards = [...col.cards];
              newCards.splice(
                typeof idx === "number" && idx >= 0 ? idx : newCards.length,
                0,
                card,
              );
              return { ...col, cards: newCards };
            }
            return col;
          });

          const newProjects = [...state.projects];
          newProjects[pIdx] = { ...proj, columns: newCols };
          return { projects: newProjects };
        });
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
            cards: col.cards.map((c, i) => ({
              id: genId("card"),
              number: i + 1,
              title: c.title,
              color: c.color,
              tasks: c.tasks,
            })),
          })),
        };

        set((state) => ({
          projects: [...state.projects, newP],
          activeProjectId: newP.id,
        }));
      },

      addProject: (name) => {
        const genId = (p: string) => `${p}-${Date.now()}`;
        const newP: Project = {
          id: genId("proj"),
          name,
          columns: [
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
              cards: [],
            },
            {
              id: genId("col-done"),
              title: "Done",
              color: "#dcfce7",
              cards: [],
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
                  columns: [
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
                          cards: [
                            ...col.cards,
                            {
                              ...data,
                              id: `card-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                              number: col.cards.length + 1,
                            },
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
                          cards: col.cards
                            .filter((c) => c.id !== cardId)
                            .map((c, i) => ({ ...c, number: i + 1 })),
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
    }),
    {
      name: "chat2canvas-storage",
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
    },
  ),
);
