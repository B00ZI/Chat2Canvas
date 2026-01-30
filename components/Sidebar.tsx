import { Button } from "./ui/button"

export default function Sidebar() {

    return (
        <div className="bg-white w-60 h-screen p-4 flex flex-col space-y-4 border-r border-gray-200">
            <h2 className="text-2xl font-bold">Chat2Canvas</h2>

            <div className="space-y-2">
                <div className="text-sm hover:bg-gray-100 p-2 rounded cursor-pointer">Testing</div>
                <div className="text-sm hover:bg-gray-100 p-2 rounded cursor-pointer">Work</div>
                <div className="text-sm hover:bg-gray-100 p-2 rounded cursor-pointer">Travling</div>
            </div>
            <Button className="mt-auto">+ new Projict</Button>

        </div>
    )
}