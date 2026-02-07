"use client"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, FileJson, RefreshCw, Zap } from "lucide-react"

import { useState } from "react"
import { useProjectStore } from "@/store/projectStore"

interface AIToolsModalProps {
  open: boolean
  onClose: () => void
}

export default function AIToolsModal({ open, onClose }: AIToolsModalProps) {

  const activeProjectId = useProjectStore((state) => state.activeProjectId);
  const projects = useProjectStore((state) => state.projects);
  const importProject = useProjectStore((state) => state.importProject)
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
  const formatReminder = `As the Chat2Canvas Planning Engine, please return the updated project plan in this exact JSON format:

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

Strict Rules for Chat2Canvas Compatibility:
1. Return ONLY the raw JSON object. 
2. No introductory text, no markdown code blocks (no \`\`\`json), and no closing remarks.
3. Do NOT include "id" or "number" fields; our system generates these automatically.
4. Use ONLY these hex colors: #f8fafc, #e0f2fe, #dcfce7, #fef3c7, #fee2e2.`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Show a toast notification "Copied!"
  }

  const handleImport = () => {

    try {

      const jsonMatch = importText.match(/\{[\s\S]*\}/)

      if (!jsonMatch) {
        alert("No Canvas Code found. Make sure you copied the entire code.")
        return
      }

      const data = JSON.parse(jsonMatch[0])

      if (!data.name || !Array.isArray(data.columns)) {
        alert("Invalid Canvas Code. Missing 'name' or 'columns'.")
        return
      }

      importProject(data)
      setImportText("")
      onClose()

    } catch (error) {

      alert("Failed to import. Make sure the Canvas Code is valid." + error)

    }

  }

  const handleCopyProgress = () => {
    const currentProject = projects.find(p => p.id === activeProjectId);
    if (!currentProject) {
      alert("No active project to sync!");
      return;
    }

    const projectJson = JSON.stringify(currentProject, null, 2);
    const syncMessage = `Here is my current project progress for "${currentProject.name}":\n\n${projectJson}\n\n Review this and suggest updates.`;


    handleCopy(syncMessage)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border-none shadow-2xl rounded-3xl p-0">
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-3 mb-1">
              <div className="bg-indigo-600 p-2 rounded-xl">
                <Zap className="w-5 h-5 text-white fill-current" />
              </div>
              <DialogTitle className="text-2xl font-bold tracking-tight">AI Planning Tools</DialogTitle>
            </div>
            <DialogDescription className="text-slate-500">
              Design your project workflow using the power of AI.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="start" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-slate-100 p-1 rounded-2xl h-12 mb-8">
              <TabsTrigger value="start" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Start Fresh</TabsTrigger>
              <TabsTrigger value="import" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Import</TabsTrigger>
              <TabsTrigger value="sync" className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-sm">Sync</TabsTrigger>
            </TabsList>

            {/* Tab 1: Start Fresh */}
            {/* Tab 1: Start Fresh */}
            <TabsContent value="start" className="space-y-6 focus-visible:outline-none">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-1">
                    <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                      Quick Start Guide
                    </h3>
                    <p className="text-sm text-slate-500">Follow these steps to bridge your AI chat to Chat2Canvas.</p>
                  </div>

                  <div className="space-y-5">
                    {[
                      "Plan your project in ChatGPT or Claude",
                      "Copy the specialized Creator Prompt below",
                      "Paste it to your AI to generate the code",
                      "Copy that code and head to the Import tab"
                    ].map((text, i) => (
                      <div key={i} className="flex items-center gap-4 group">
                        {/* Using your Badge component here */}
                        <Badge
                          variant="secondary"
                          className="h-7 w-7 rounded-full flex items-center justify-center p-0 bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors"
                        >
                          {i + 1}
                        </Badge>
                        <p className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                          {text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 rounded-3xl p-5 shadow-2xl relative group border border-slate-800">
                    <div className="flex justify-between items-center mb-3">
                      <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 uppercase tracking-widest px-2 py-0">
                        System Prompt
                      </Badge>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-500/50" />
                        <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                      </div>
                    </div>
                    <div className="max-h-44 overflow-y-auto font-mono text-[11px] text-slate-400 leading-relaxed scrollbar-hide">
                      {creatorPrompt}
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-slate-950 to-transparent rounded-b-3xl pointer-events-none" />
                  </div>

                  <Button
                    onClick={() => handleCopy(creatorPrompt)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl py-7 shadow-xl shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Creator Prompt
                  </Button>
                </div>
              </div>
            </TabsContent>


            {/* Tab 2: Import */}
            <TabsContent value="import" className="space-y-6 focus-visible:outline-none">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-4 items-start">
                <div className="bg-blue-500 p-2 rounded-lg text-white">
                  <FileJson className="w-4 h-4" />
                </div>
                <p className="text-xs text-blue-700 leading-normal">
                  Paste the <strong>Canvas Code</strong> provided by the AI. Ensure you include the opening <code className="bg-blue-200/50 px-1 rounded">{"{"}</code> and closing <code className="bg-blue-200/50 px-1 rounded">{"}"}</code> braces.
                </p>
              </div>

              <textarea
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                className="w-full h-64 p-5 bg-slate-50 border-slate-200 rounded-2xl font-mono text-xs resize-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all shadow-inner border"
                placeholder='{ "name": "Project Title", ... }'
              />

              <Button
                onClick={handleImport}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-xl py-6 transition-all active:scale-95"
              >
                🚀 Launch Project Plan
              </Button>
            </TabsContent>

            {/* Tab 3: Sync */}
            <TabsContent value="sync" className="space-y-6 focus-visible:outline-none">
              <div className="space-y-4">
                <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 text-center">
                  <div className="bg-white w-12 h-12 rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-indigo-50">
                    <RefreshCw className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Sync with AI</h3>
                  <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6">
                    Send your current progress back to the AI to refine your plan or generate next steps.
                  </p>
                  <Button
                    onClick={handleCopyProgress}
                    className="bg-white text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-xl px-8 shadow-sm transition-all"
                  >
                    Copy Current State
                  </Button>
                </div>

                <div className="pt-6 border-t flex flex-col items-center">
                  <p className="text-[11px] text-slate-400 font-medium mb-3 uppercase tracking-wider">Forgot the format?</p>
                  <Button
                    onClick={() => handleCopy(formatReminder)}
                    variant="ghost"
                    className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl w-full py-4 text-xs font-medium"
                  >
                    Resend Schema Instructions
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}