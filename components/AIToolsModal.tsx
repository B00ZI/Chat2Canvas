"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useProjectStore } from "@/store/projectStore"

interface AIToolsModalProps {
  open: boolean
  onClose: () => void
}

export default function AIToolsModal({ open, onClose }: AIToolsModalProps) {

  const importProject = useProjectStore((state)=> state.importProject)
  const [importText, setImportText] = useState("")

  // System prompt for creating plans
  const creatorPrompt = `You are a project planning assistant for Chat2Canvas.

INSTRUCTIONS:
1. Help the user break down their project into organized phases, tasks, and subtasks
2. If the user has already described a project in our conversation, immediately convert it to Canvas Code
3. If this is a new conversation or the project is unclear, ask: "What project are we planning? Describe your idea so I can help structure it."

WHEN OUTPUTTING CANVAS CODE:
- Say exactly this line first: "You can copy the code below to Chat2Canvas:"
- Then output the Canvas Code
- Do NOT add any text after the code
- The code must start with { and end with }

CANVAS CODE RULES:
- Do NOT generate "id" or "number" fields
- Use only these colors: #f8fafc (slate), #e0f2fe (blue), #dcfce7 (green), #fef3c7 (yellow), #fee2e2 (red)
- "tasks" must always be an array (use [] if empty)

REQUIRED FORMAT:
{
  "name": "Project Name",
  "columns": [
    {
      "title": "Phase Name",
      "color": "#e0f2fe",
      "cards": [
        {
          "title": "Task Name",
          "color": "#dcfce7",
          "tasks": [
            { "text": "Subtask description", "done": false }
          ]
        }
      ]
    }
  ]
}

EXAMPLE OUTPUT:
You can copy the code below to Chat2Canvas:
{
  "name": "Build Portfolio Website",
  "columns": [
    {
      "title": "Design",
      "color": "#e0f2fe",
      "cards": [
        {
          "title": "Create Wireframes",
          "color": "#fef3c7",
          "tasks": [
            { "text": "Sketch homepage", "done": false },
            { "text": "Design project gallery", "done": false }
          ]
        }
      ]
    },
    {
      "title": "Development",
      "color": "#dcfce7",
      "cards": [
        {
          "title": "Setup Next.js",
          "color": "#e0f2fe",
          "tasks": [
            { "text": "Initialize project", "done": false },
            { "text": "Configure Tailwind", "done": false }
          ]
        }
      ]
    }
  ]
}`

  // Format reminder for when AI forgets
  const formatReminder = `Please return the updated project plan as a JSON object in this format:

{
  "projectName": "Project Title",
  "columns": [
    {
      "id": "col-1",
      "title": "Column Name", 
      "color": "#4F46E5",
      "cards": [
        {
          "id": "card-1",
          "number": 1,
          "title": "Task Title",
          "color": "#4F46E5",
          "tasks": [
            {"text": "Subtask 1", "done": false}
          ]
        }
      ]
    }
  ]
}

                     Return ONLY the JSON, no markdown or explanations.`

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Show a toast notification "Copied!"
  }

  const handleImport = () => {

    const cleanJson = importText.match(/\{[\s\S]*\}/)

    if (cleanJson) {
      const parsedJson = JSON.parse(cleanJson[0])
      importProject(parsedJson)
      onClose()

    }
   
  }

  const handleCopyProgress = () => {
    // TODO: Get current project state and format it
    const currentPlan = `Here is my current project progress:

    [Current project JSON will go here]

    Please review this and suggest improvements or next steps. When you're ready to provide the updated plan,
     return it as Canvas Code (JSON) in the same format.`

    handleCopy(currentPlan)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>AI Planning Tools</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="start" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="start">Start Fresh</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
            <TabsTrigger value="sync">Sync</TabsTrigger>
          </TabsList>

          {/* Tab 1: Start Fresh */}
          <TabsContent value="start" className="space-y-4 mt-4">
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-base mb-3">How to create your plan:</p>
              <div className="space-y-2">
                <p><span className="font-medium">Step 1:</span> Go to your favorite AI (ChatGPT, Claude, Gemini).</p>
                <p><span className="font-medium">Step 2:</span> Chat and brainstorm until you are happy with your project plan.</p>
                <p><span className="font-medium">Step 3:</span> Click the [Copy Creator Prompt] button below.</p>
                <p><span className="font-medium">Step 4:</span> Paste it to your AI. It will generate a "Canvas Code" (JSON).</p>
                <p><span className="font-medium">Step 5:</span> Copy that code and head over to the Import tab.</p>
              </div>
            </div>

            <div className="bg-gray-50 border rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-2">Creator Prompt:</p>
              <div className="bg-white border rounded p-3 max-h-48 overflow-y-auto font-mono text-xs">
                {creatorPrompt}
              </div>
            </div>

            <Button onClick={() => handleCopy(creatorPrompt)} className="w-full">
              Copy Creator Prompt
            </Button>
          </TabsContent>

          {/* Tab 2: Import */}
          <TabsContent value="import" className="space-y-4 mt-4">
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-base mb-3">The bridge from text to your interactive UI.</p>
              <div className="space-y-2">
                <p><span className="font-medium">Step 1:</span> Paste the "Canvas Code" (JSON) from your AI into the box below.</p>
                <p><span className="font-medium">Step 2:</span> Click [Plan It].</p>
                <p><span className="font-medium">Step 3:</span> Your dashboard will update instantly, and this window will close.</p>
              </div>
              <p className="text-xs text-gray-600 mt-3">
                <span className="font-medium">Note:</span> If you get an error, ensure you copied the entire code block from `{"{"}` to `{"}"}`.
              </p>
            </div>

            <textarea
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full h-64 p-3 border rounded-lg font-mono text-xs resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder='Paste your Canvas Code here...'
            />

            <Button onClick={handleImport} className="w-full">
              Plan It
            </Button>
          </TabsContent>

          {/* Tab 3: Sync */}
          <TabsContent value="sync" className="space-y-4 mt-4">
            <div className="space-y-3 text-sm">
              <p className="font-semibold text-base mb-3">Update your AI with your current progress.</p>
              <div className="space-y-2">
                <p><span className="font-medium">Step 1:</span> Click [Copy Progress & Instructions] to grab your current task list.</p>
                <p><span className="font-medium">Step 2:</span> Paste it into your AI and discuss any changes or next steps.</p>
                <p><span className="font-medium">Step 3:</span> Once finished, ask the AI for the updated "Canvas Code" and bring it to the Import tab.</p>
              </div>
            </div>

            <Button onClick={handleCopyProgress} className="w-full">
              Copy Progress & Instructions
            </Button>

            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3">Rescue Step (Optional):</p>
              <p className="text-sm text-gray-600 mb-3">
                If your AI forgot the format after a long chat, click this button and paste it to the AI to get your code.
              </p>
              <Button
                onClick={() => handleCopy(formatReminder)}
                variant="outline"
                className="w-full"
              >
                Copy Format Reminder
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}