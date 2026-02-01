import { Button } from "./ui/button"

export default function Sidebar() {

    return (
        <div className="bg-white w-60 h-screen pb-4 flex flex-col space-y-4 border-r border-gray-200">
            <div className="h-20 flex justify-center items-center border-b">
                <h2 className=" text-2xl font-bold  ">Chat2Canvas</h2>
            </div>


            <div className="space-y-2 p-4">
                <div className="text-sm font-semibold hover:bg-gray-100 p-2 rounded cursor-pointer">Testing</div>
                <div className="text-sm font-semibold hover:bg-gray-100 p-2 rounded cursor-pointer">Testing</div>
                <div className="text-sm font-semibold hover:bg-gray-100 p-2 rounded cursor-pointer">Work</div>
                <div className="text-sm font-semibold hover:bg-gray-100 p-2 rounded cursor-pointer">Travling</div>
                <div className="text-sm font-semibold bg-gray-400 p-2 rounded cursor-pointer">+ New Project</div>

            </div>


        </div>
    )
}