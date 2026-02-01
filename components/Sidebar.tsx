'use client'

import { useProjectStore } from "@/store/projectStore"

export default function Sidebar() {

    const projects = useProjectStore((state) => state.projects)
    const addProject = useProjectStore((state) => state.addProject)

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
                    <div key={project.id} className="text-sm font-semibold hover:bg-gray-100 px-3 py-2 rounded cursor-pointer">{project.name}</div>
                ))}

                <div onClick={addNewProject} className="text-sm font-semibold bg-gray-400 px-3 py-2  rounded cursor-pointer">+ New Project</div>

            </div>


        </div>
    )
}