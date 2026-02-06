import { create } from "zustand";

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

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;

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

  addCard: (projectId: string, colId: string, cardData: Omit<Card, "id" | "number" | "tasks">) => void;

  //   addCard(projectId, columnId, cardData)
  // editCard(projectId, columnId, cardId, updates)
  // deleteCard(projectId, columnId, cardId)
  // toggleTask(projectId, columnId, cardId, taskIndex)
}

export const useProjectStore = create<ProjectStore>((set) => ({
  // Initial data values
  projects: [],
  activeProjectId: null,

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
      const newProjects = state.projects.filter((project) => project.id !== id);
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
    const newCard = {
      id: String(Date.now()),
      number: 5,
      tasks: [],
      ...cardData,
    };
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? {
              ...project,
              columns: project.columns.map((col) =>
                col.id === colId
                  ? { ...col, cards: [...col.cards, { ...newCard , number: col.cards.length + 1}] }
                  : col,
              ),
            }
          : project,
      ),
    }));
  },
}));
