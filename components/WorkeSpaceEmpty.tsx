import { Button } from "./ui/button"

export default function WorkeSpaceEmpty() {
    return (
        <div className="flex items-center justify-center h-full p-8">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to Your New Project!</h2>
                <p className="text-gray-600 mb-8">You have two ways to start:</p>

                <div className="grid grid-cols-2 gap-6 mb-6">
                    {/* AI Planning */}
                    <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
                        <div className="text-3xl mb-3">🤖</div>
                        <h3 className="font-semibold text-lg mb-2">Plan with AI</h3>
                        <ol className="text-sm text-gray-700 space-y-2 mb-4">
                            <li>1. Click "Get AI Prompt"</li>
                            <li>2. Copy and paste into ChatGPT/Claude</li>
                            <li>3. Describe your project</li>
                            <li>4. Import the JSON response</li>
                        </ol>
                        <Button className="w-full">Get AI Prompt</Button>
                    </div>

                    {/* Manual */}
                    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <div className="text-3xl mb-3">✏️</div>
                        <h3 className="font-semibold text-lg mb-2">Build Manually</h3>
                        <ol className="text-sm text-gray-700 space-y-2 mb-4">
                            <li>1. Click "New Column"</li>
                            <li>2. Add cards to each column</li>
                            <li>3. Start working!</li>
                        </ol>
                        <Button variant="outline" className="w-full">Add First Column</Button>
                    </div>
                </div>

                <p className="text-sm text-gray-500 text-center">
                    Tip: You can use AI anytime with the "Share" and "Update Plan" buttons
                </p>
            </div>
        </div>
    )
}