'use client'
import { useState } from "react"
import { useProjectStore } from "@/store/projectStore"
import { NewProjectDialog } from "./NewProjectDialog"
import { EditProjectDialog } from "./EditProjectDialog"
export default function Sidebar() {

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)



    const projects = useProjectStore((state) => state.projects)
    const addProject = useProjectStore((state) => state.addProject)

    const activeProjectId = useProjectStore((state) => state.activeProjectId)
    const setActiveProject = useProjectStore((state) => state.setActiveProject)

    function addNewProject() {
        let name = prompt("project name: ")
        if (name) {
            addProject(name)
        }
    }


    return (
        <div className="bg-white w-60 h-screen pb-4 flex flex-col space-y-4 border-r border-gray-200">
            <div className="h-20 flex justify-center items-center border-b">
                <h2 className=" text-2xl font-bold  ">Chat2Canvas</h2>
            </div>


            <div className="space-y-2 p-4">
                {projects.map((project) => (
                    <div onClick={() => setActiveProject(project.id)} key={project.id} className={`flex flex-row justify-between text-sm font-semibold px-3 py-2 rounded cursor-pointer ${activeProjectId === project.id ? 'bg-blue-100' : "hover:bg-gray-100"} `}>
                        {project.name}
                        <button className=" w-5 h-5  text-black font-extrabold hover:bg-gray-200 rounded-2xl" onClick={()=> setIsEditDialogOpen(true)} > ⋮ </button>
                        <EditProjectDialog open={isEditDialogOpen} onClose={()=> setIsEditDialogOpen(false)} projectId={project.id} projectName={project.name}  /> 
                    </div>
                ))}

                <div onClick={() => setIsModalOpen(true)} className="text-sm font-semibold bg-gray-400 px-3 py-2  rounded cursor-pointer">+ New Project</div>

            </div>

            <NewProjectDialog open={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    )
}