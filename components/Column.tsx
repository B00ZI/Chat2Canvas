import { Button } from "./ui/button"
import Card from "./Card"

interface ColumnProps {
    title: string
    color: string
    cardCount: number
}

export default function Column({ title, color, cardCount }: ColumnProps) {
    return (
        <div className="bg-white rounded-lg p-4 w-80 flex-shrink-0 shadow-sm border border-gray-200">
            {/* Column Header */}
            <div className="mb-4">
                <div className="h-1 rounded-t-lg mb-3" style={{ backgroundColor: color }} />
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-lg">{title}</h3>
                        <p className="text-sm text-gray-500">{cardCount} tasks</p>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">⋮</button>
                </div>
            </div>

            {/* Cards go here - empty for now */}

            <div className="space-y-3 mb-3">
                <Card
                    number={1}
                    title="Setup Database"
                    color="#4F46E5"
                    tasks={[
                        { text: "Create schema", done: true },
                        { text: "Setup migrations", done: false },
                        { text: "Add seed data", done: false }
                    ]}
                />
            </div>

            {/* Add Card Button */}
            <button className="w-full border-2 border-dashed border-gray-300 rounded-lg p-3 text-sm text-gray-500 hover:border-gray-400 hover:text-gray-600">
                + Add New Task
            </button>
        </div>
    )
}