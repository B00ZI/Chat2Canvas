import { create } from "zustand";
import { persist } from "zustand/middleware";

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

  // toggleTask(projectId, columnId, cardId, taskIndex)
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      // Initial data values
      projects: [],
      activeProjectId: null,

      importProject: (projectData) => {
        function genId(type: string, idx: string) {
          return `${type} - ${idx} - ${String(Date.now())}`;
        }

        const newProject = {
          id: genId("project", projectData.name),
          name: projectData.name,
          columns: projectData.columns.map((col, ColIdx) => ({
            id: genId("col", String(ColIdx)),
            title: col.title,
            color: col.color,
            cards: col.cards.map((card, cardIdx) => ({
              id: genId("card", String(cardIdx)),
              number: cardIdx + 1,
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

      // Functions (actions)
      addProject: (name) => {
        const newProject = {
          id: String(Date.now()),
          name: name,
          columns: [
            {
              id: `col-todo-${Date.now()}`,
              title: "To Do",
              color: "#f1f5f9", // Light Slate
              cards: [],
            },
            {
              id: `col-progress-${Date.now()}`,
              title: "In Progress",
              color: "#e0f2fe", // Light Blue
              cards: [],
            },
            {
              id: `col-done-${Date.now()}`,
              title: "Done",
              color: "#dcfce7", // Light Green
              cards: [],
            },
          ],
        };

        set((state) => ({
          projects: [...state.projects, newProject],
          activeProjectId: newProject.id,
        }));
      },

      editProject: (id, newName) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === id ? { ...project, name: newName } : project,
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => {
          const newProjects = state.projects.filter(
            (project) => project.id !== id,
          );
          return {
            projects: newProjects,
            activeProjectId:
              state.activeProjectId === id
                ? newProjects[0]?.id || null
                : state.activeProjectId,
          };
        });
      },

      setActiveProject: (id) => {
        set({ activeProjectId: id });
      },

      addColumn: (projectId, title, color) => {
        const newColumn = {
          id: String(Date.now()),
          title: title,
          color: color,
          cards: [],
        };

        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? { ...project, columns: [...project.columns, newColumn] }
              : project,
          ),
        }));
      },

      deleteColumn: (projectId, columnId) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  columns: project.columns.filter((col) => col.id !== columnId),
                }
              : project,
          ),
        }));
      },
      editColumn: (projectId, columnId, updates) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  columns: project.columns.map((col) =>
                    col.id === columnId ? { ...col, ...updates } : col,
                  ),
                }
              : project,
          ),
        }));
      },

      addCard: (projectId, colId, cardData) => {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  columns: project.columns.map((col) =>
                    col.id === colId
                      ? {
                          ...col,
                          cards: [
                            ...col.cards,
                            {
                              ...cardData,
                              id: String(Date.now()),
                              number: col.cards.length + 1,
                            },
                          ],
                        }
                      : col,
                  ),
                }
              : project,
          ),
        }));
      },
      editCard(projectId, columnId, cardId, updates) {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  columns: project.columns.map((col) =>
                    col.id === columnId
                      ? {
                          ...col,
                          cards: col.cards.map((card) =>
                            card.id === cardId ? { ...card, ...updates } : card,
                          ),
                        }
                      : col,
                  ),
                }
              : project,
          ),
        }));
      },
      deleteCard(projectId, columnId, cardId) {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  columns: project.columns.map((col) =>
                    col.id === columnId
                      ? {
                          ...col,
                          cards: col.cards.filter((card) => card.id !== cardId),
                        }
                      : col,
                  ),
                }
              : project,
          ),
        }));
      },

      toggleTask(projectId, columnId, cardId, taskIndex) {
        set((state) => ({
          projects: state.projects.map((project) =>
            project.id === projectId
              ? {
                  ...project,
                  columns: project.columns.map((col) =>
                    col.id === columnId
                      ? {
                          ...col,
                          cards: col.cards.map((card) =>
                            card.id === cardId
                              ? {
                                  ...card,
                                  tasks: card.tasks.map((task, index) =>
                                    index === taskIndex
                                      ? { ...task, done: !task.done }
                                      : task,
                                  ),
                                }
                              : card,
                          ),
                        }
                      : col,
                  ),
                }
              : project,
          ),
        }));
      },
    }),
    {
      name: "chat2canvas-storage", // localStorage key
    },
  ),
);
