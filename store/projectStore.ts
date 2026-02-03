import Column from "@/components/Column";
import { stat } from "fs";
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
  editColumn: (projectId: string , columnId:string , newColumnTitle: string) => void;
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
      columns: [],
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

  deleteColumn: (projectId , columnId)=>{
 
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === projectId
          ? { ...project, columns: project.columns.filter((col)=>col.id !== columnId) }
          : project,
      ),
    }));
     
  },
   editColumn: (id, newName) => {
    set((state) => ({
      projects: state.projects.map((project) =>
        project.id === id ? { ...project, name: newName } : project,
      ),
    }));
  },
}));
