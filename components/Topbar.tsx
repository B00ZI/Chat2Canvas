import { Button } from "./ui/button"

export default function TopBar() {
  return (
    <div className="h-20 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
      {/* Left - Project Name */}
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Project Name</h1>
        <p className="text-sm text-gray-500">5 of 10 tasks completed</p>
      </div>

      {/* Right - Buttons */}
      <div className="flex gap-3">
        <Button variant="outline">AI Tools</Button>
        <Button >New Column</Button>
      </div>
    </div>
  )
}