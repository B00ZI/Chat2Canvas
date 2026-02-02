import { create } from "zustand";

interface Project {
  id: string;
  name: string;
}

interface ProjectStore {
  projects: Project[];
  activeProjectId: string | null;

  addProject: (name: string) => void;
  editProject: (id: string, newName: string) => void;
  deleteProject: (id: string) => void;
  setActiveProject: (id: string) => void;
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
}));
