import { create } from 'zustand'

interface Project {
  id: string  
  name: string
}

interface ProjectStore {
  projects: Project[]  
  activeProjectId: string| null  
  
  addProject: (name : string) => void  
  deleteProject: (id : string) => void
  setActiveProject: (id:string) => void
}

export const useProjectStore = create<ProjectStore>((set) => ({
  // Initial data values
  projects: [],
  activeProjectId: null,
  
  // Functions (actions)
  addProject: (name) => {
    
    const newProject = {
        id:String(Date.now()),
        name:name
    }

    set((state) => ({
       projects : [ ...state.projects , newProject ]
    }))

  },
  
  deleteProject: (id) => {
     set((state)=>({
        projects: state.projects.filter((project)=> project.id !== id)
     }))
  },
  
  setActiveProject: (id) => {
    set({activeProjectId : id})
  }
}))