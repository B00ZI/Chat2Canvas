import { create } from "zustand";
import { persist } from "zustand/middleware";
import { arrayMove } from "@dnd-kit/sortable";

// --- Types ---
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

  // Actions
  importProject: (projectData: ImportData) => void;
  addProject: (name: string) => void;
  editProject: (id: string, newName: string) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string) => void;

  addColumn: (projectId: string, title: string, color: string) => void;
  deleteColumn: (projectId: string, columnId: string) => void;
  editColumn: (projectId: string, columnId: string, updates: Partial<Column>) => void;

  addCard: (projectId: string, colId: string, cardData: Omit<Card, "id" | "number">) => void;
  editCard: (projectId: string, columnId: string, cardId: string, updates: Partial<Card>) => void;
  deleteCard: (projectId: string, columnId: string, cardId: string) => void;
  
  toggleTask: (projectId: string, columnId: string, cardId: string, taskIndex: number) => void;

  reorderCards: (projectId: string, columnId: string, oldIndex: number, newIndex: number) => void;

  // NEW: Action to reorder columns
  reorderColumns: (projectId: string, oldIndex: number, newIndex: number) => void;

  moveCardBetweenColumns: (
    projectId: string,
    cardId: string,
    fromColumnId: string,
    toColumnId: string,
    insertIndex?: number 
  ) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      activeProjectId: null,

      // --- NEW IMPLEMENTATION ---
      reorderColumns: (projectId, oldIndex, newIndex) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  columns: arrayMove(project.columns, oldIndex, newIndex),
                }
              : project
          ),
        }));
      },
      // --------------------------

      reorderCards: (projectId, columnId, oldIndex, newIndex) => {
        set((state) => ({
          projects: state.projects.map((project) => {
            if (project.id !== projectId) return project;

            return {
              ...project,
              columns: project.columns.map((col) => {
                if (col.id !== columnId) return col;

                const newCards = arrayMove(col.cards, oldIndex, newIndex).map(
                  (card, idx) => ({ ...card, number: idx + 1 })
                );

                return { ...col, cards: newCards };
              }),
            };
          }),
        }));
      },

      moveCardBetweenColumns: (projectId, cardId, fromColumnId, toColumnId, insertIndex) => {
        set((state) => {
          const project = state.projects.find((p) => p.id === projectId);
          if (!project) return state;

          const sourceCol = project.columns.find((c) => c.id === fromColumnId);
          const targetCol = project.columns.find((c) => c.id === toColumnId);
          const cardToMove = sourceCol?.cards.find((c) => c.id === cardId);

          if (!sourceCol || !targetCol || !cardToMove) return state;

          return {
            projects: state.projects.map((proj) => {
              if (proj.id !== projectId) return proj;

              return {
                ...proj,
                columns: proj.columns.map((col) => {
                  if (col.id === fromColumnId) {
                    return {
                      ...col,
                      cards: col.cards
                        .filter((c) => c.id !== cardId)
                        .map((c, i) => ({ ...c, number: i + 1 })), 
                    };
                  }

                  if (col.id === toColumnId) {
                    let newCards = [...col.cards];
                    if (typeof insertIndex === 'number' && insertIndex >= 0 && insertIndex <= newCards.length) {
                       newCards.splice(insertIndex, 0, cardToMove);
                    } else {
                       newCards.push(cardToMove);
                    }
                    return {
                      ...col,
                      cards: newCards.map((c, i) => ({ ...c, number: i + 1 })), 
                    };
                  }
                  return col;
                }),
              };
            }),
          };
        });
      },

      importProject: (projectData) => {
        const genId = (prefix: string) => 
          `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

        const newProject: Project = {
          id: genId("proj"),
          name: projectData.name,
          columns: projectData.columns.map((col) => ({
            id: genId("col"),
            title: col.title,
            color: col.color,
            cards: col.cards.map((card, idx) => ({
              id: genId("card"),
              number: idx + 1,
              title: card.title,
              color: card.color,
              tasks: card.tasks,
            })),
          })),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));
      },

      addProject: (name) => {
        const genId = (prefix: string) => `${prefix}-${Date.now()}`;
        
        const newProject: Project = {
          id: genId("proj"),
          name: name,
          columns: [
            { id: genId("col-todo"), title: "To Do", color: "#f1f5f9", cards: [] },
            { id: genId("col-prog"), title: "In Progress", color: "#e0f2fe", cards: [] },
            { id: genId("col-done"), title: "Done", color: "#dcfce7", cards: [] },
          ],
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));
      },

      editProject: (id, newName) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, name: newName } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter((p) => p.id !== id);
          return {
            projects: newProjects,
            activeProjectId: state.activeProjectId === id 
              ? (newProjects[0]?.id || null) 
              : state.activeProjectId,
          };
        });
      },

      setActiveProject: (id) => set({ activeProjectId: id }),

      addColumn: (projectId, title, color) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              columns: [
                ...p.columns,
                {
                  id: `col-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
                  title,
                  color,
                  cards: [],
                },
              ],
            };
          }),
        }));
      },

      deleteColumn: (projectId, columnId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, columns: p.columns.filter((c) => c.id !== columnId) }
              : p
          ),
        }));
      },

      editColumn: (projectId, columnId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  columns: p.columns.map((col) =>
                    col.id === columnId ? { ...col, ...updates } : col
                  ),
                }
              : p
          ),
        }));
      },

      addCard: (projectId, colId, cardData) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              columns: p.columns.map((col) => {
                if (col.id !== colId) return col;
                return {
                  ...col,
                  cards: [
                    ...col.cards,
                    {
                      ...cardData,
                      id: `card-${Date.now()}-${Math.random().toString(36).substr(2,5)}`,
                      number: col.cards.length + 1,
                    },
                  ],
                };
              }),
            };
          }),
        }));
      },

      editCard: (projectId, columnId, cardId, updates) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              columns: p.columns.map((col) =>
                col.id === columnId
                  ? {
                      ...col,
                      cards: col.cards.map((c) =>
                        c.id === cardId ? { ...c, ...updates } : c
                      ),
                    }
                  : col
              ),
            };
          }),
        }));
      },

      deleteCard: (projectId, columnId, cardId) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              columns: p.columns.map((col) =>
                col.id === columnId
                  ? { ...col, cards: col.cards.filter((c) => c.id !== cardId) }
                  : col
              ),
            };
          }),
        }));
      },

      toggleTask: (projectId, columnId, cardId, taskIndex) => {
        set((state) => ({
          projects: state.projects.map((p) => {
            if (p.id !== projectId) return p;
            return {
              ...p,
              columns: p.columns.map((col) => {
                if (col.id !== columnId) return col;
                return {
                  ...col,
                  cards: col.cards.map((c) => {
                    if (c.id !== cardId) return c;
                    const newTasks = [...c.tasks];
                    if (newTasks[taskIndex]) {
                        newTasks[taskIndex] = { 
                            ...newTasks[taskIndex], 
                            done: !newTasks[taskIndex].done 
                        };
                    }
                    return { ...c, tasks: newTasks };
                  }),
                };
              }),
            };
          }),
        }));
      },
    }),
    {
      name: "chat2canvas-storage",
    }
  )
);