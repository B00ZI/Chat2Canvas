import TopBar from "@/components/Topbar"
import EmptyState from "@/components/EmptyState"
import Column from "@/components/Column"
import AIToolsModal from "@/components/AIToolsModal"
import Card from "@/components/Card"

export default function Home() {
  // Later this will come from state, for now hardcoded to see the UI
  const showEmpty = false // Change to true to see empty state

  return (
    <div className="flex-1 bg-gray-50">
      <TopBar />
      
      {showEmpty ? (
        <EmptyState />
      ) : (
        <div className="p-6 overflow-x-auto">
          <div className="flex gap-4">
            {/* Example columns - later from state */}
            <Column title="Frontend" color="#4F46E5" cardCount={3} />
            <Column title="Backend" color="#10B981" cardCount={2} />
          </div>
        </div>
      )}
    </div>
  )
}