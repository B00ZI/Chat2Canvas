'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Zap, FileText, ArrowDownToLine, ArrowUpFromLine, Check } from "lucide-react"
import { INSTRUCTIONS_PROMPTS } from "@/lib/prompts"
import { useMemo, useState } from "react"
import { useProjectStore } from "@/store/projectStore"
import { ImportData } from "@/lib/types"
import { toast } from "sonner"

interface AIToolsModalProps {
  open: boolean
  onClose: () => void
}

const STEPS = [
  "Plan your project in ChatGPT or Claude",
  "Copy the Creator Prompt below and paste it into the chat",
  "Your AI replies with Canvas Code — copy that code",
  "Open the Import tab here and paste it in",
]

export default function AIToolsModal({ open, onClose }: AIToolsModalProps) {
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const projects = useProjectStore((state) => state.projects)
  const importProject = useProjectStore((state) => state.importProject)

  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState<string | null>(null)
  const [copiedCreator, setCopiedCreator] = useState(false)
  const [copiedExport, setCopiedExport] = useState(false)

  const creatorPrompt = INSTRUCTIONS_PROMPTS
  const currentProject = projects.find((p) => p.id === activeProjectId)

  // Clean export payload — what gets copied back to the AI chat
  const exportPreview = useMemo(() => {
    if (!currentProject) return ""
    return JSON.stringify(
      {
        name: currentProject.name,
        columns: currentProject.columns.map((col) => ({
          title: col.title,
          color: col.color,
          cards: col.cards.map((card) => ({
            title: card.title,
            color: card.color,
            tasks: card.tasks,
          })),
        })),
      },
      null,
      2
    )
  }, [currentProject])

  const handleCopy = (text: string, type?: "creator" | "export") => {
    navigator.clipboard.writeText(text)
    if (type === "creator") {
      setCopiedCreator(true)
      setTimeout(() => setCopiedCreator(false), 1600)
    }
    if (type === "export") {
      setCopiedExport(true)
      setTimeout(() => setCopiedExport(false), 1600)
    }
  }

  const handleImport = () => {
    try {
      setImportError(null)

      if (!importText.trim()) {
        setImportError("Please paste the project code before importing.")
        return
      }

      const jsonMatch = importText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        setImportError(
          "Couldn't find your project data. Make sure you pasted the code correctly."
        )
        return
      }

      const data: ImportData = JSON.parse(jsonMatch[0])

      if (!data.name || !Array.isArray(data.columns)) {
        setImportError(
          "Your project data is incomplete. Make sure it has a project name and columns."
        )
        return
      }

      importProject(data)
      setImportText("")
      onClose()
      toast.success(`"${data.name}" imported`)
    } catch {
      setImportError(
        "We couldn't read your project. Make sure the pasted code is valid."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          flex flex-col gap-0 overflow-hidden p-0
          w-full max-w-[calc(100vw-1rem)] sm:w-[900px] sm:max-w-[94vw]
          h-dvh max-h-none sm:h-[620px] sm:max-h-[92vh]
          rounded-none sm:rounded-xl border-0 sm:border
        "
      >
        {/* Header */}
        <DialogHeader className="shrink-0 gap-0 border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="bg-primary/12 text-primary shadow-xs flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
              <Zap className="size-5" />
            </div>
            <div className="flex flex-col gap-0.5">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                AI Planning Tools
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                Design your workflow with any AI chat, then bring it to the canvas.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Rail + content */}
        <Tabs defaultValue="start" orientation="vertical" className="flex min-h-0 flex-1 gap-0">
          <TabsList
            variant="line"
            className="h-full w-44 shrink-0 flex-col items-stretch gap-1 rounded-none border-r border-border bg-muted/30 p-3"
          >
            <span className="text-muted-foreground/70 mb-1 px-3 pt-1 pb-1 text-[11px] font-medium tracking-wider uppercase">
              Workflow
            </span>
            <TabsTrigger value="start" className="justify-start px-3 py-2 data-[state=active]:bg-primary/12 data-[state=active]:text-primary dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary/15">
              <FileText />
              Start fresh
            </TabsTrigger>
            <TabsTrigger value="import" className="justify-start px-3 py-2 data-[state=active]:bg-primary/12 data-[state=active]:text-primary dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary/15">
              <ArrowDownToLine />
              Import
            </TabsTrigger>
            <TabsTrigger value="export" className="justify-start px-3 py-2 data-[state=active]:bg-primary/12 data-[state=active]:text-primary dark:data-[state=active]:border-transparent dark:data-[state=active]:bg-primary/15">
              <ArrowUpFromLine />
              Export
            </TabsTrigger>
          </TabsList>

          {/* ── Start fresh ── */}
          <TabsContent
            value="start"
            className="scrollbar-slim min-w-0 space-y-6 overflow-y-auto p-6 focus-visible:outline-none"
          >
            <div className="space-y-1">
              <h3 className="text-base font-semibold tracking-tight">Quick start</h3>
              <p className="text-muted-foreground text-sm">
                Bridge your AI chat to Chat2Canvas in four steps.
              </p>
            </div>

            <ol className="space-y-3">
              {STEPS.map((text, i) => (
                <li key={i} className="group flex items-center gap-3">
                  <span className="bg-muted text-secondary-foreground group-hover:bg-primary/12 group-hover:text-primary flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-xs font-medium tabular-nums transition-colors">
                    {i + 1}
                  </span>
                  <p className="text-sm">{text}</p>
                </li>
              ))}
            </ol>

            {/* Creator prompt block */}
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="bg-muted/40 flex items-center justify-between border-b border-border px-4 py-2.5">
                <span className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                  Creator prompt
                </span>

                <Button
                  size="sm"
                  variant={copiedCreator ? "outline" : "default"}
                  onClick={() => handleCopy(creatorPrompt, "creator")}
                  className="h-7 gap-1.5 px-2.5 text-xs"
                >
                  {copiedCreator ? (
                    <>
                      <Check /> Copied
                    </>
                  ) : (
                    <>
                      <Zap /> Copy prompt
                    </>
                  )}
                </Button>
              </div>

              <pre className="scrollbar-slim text-muted-foreground max-h-60 overflow-y-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                {creatorPrompt}
              </pre>
            </div>
          </TabsContent>

          {/* ── Import ── */}
          <TabsContent
            value="import"
            className="scrollbar-slim min-w-0 space-y-4 overflow-y-auto p-6 focus-visible:outline-none"
          >
            <div className="space-y-1">
              <h3 className="text-base font-semibold tracking-tight">Paste Canvas Code</h3>
              <p className="text-muted-foreground text-sm">
                Paste the code your AI generated. Markdown fences are fine — we&apos;ll
                find the JSON.
              </p>
            </div>

            <textarea
              value={importText}
              onChange={(e) => {
                setImportText(e.target.value)
                if (importError) setImportError(null)
              }}
              spellCheck={false}
              className={`scrollbar-slim placeholder:text-muted-foreground/70 h-64 w-full resize-none rounded-xl border bg-background p-4 font-mono text-xs leading-relaxed transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                importError
                  ? "border-destructive focus-visible:ring-destructive/50"
                  : "border-input focus-visible:ring-ring/60"
              }`}
              placeholder={`{\n  "name": "My Project",\n  "columns": [ … ]\n}`}
            />

            {importError && (
              <p role="alert" className="text-destructive text-sm">
                {importError}
              </p>
            )}

            <Button
              onClick={handleImport}
              disabled={!importText.trim()}
              className="w-full gap-2 disabled:cursor-not-allowed"
            >
              <ArrowDownToLine />
              Import project
            </Button>
          </TabsContent>

          {/* ── Export ── */}
          <TabsContent
            value="export"
            className="scrollbar-slim flex min-w-0 flex-col gap-4 overflow-y-auto p-6 focus-visible:outline-none"
          >
            <div className="space-y-1">
              <h3 className="text-base font-semibold tracking-tight">Export current project</h3>
              <p className="text-muted-foreground text-sm">
                Send this snapshot back to your AI chat to refine the plan or get next
                steps. The copied text includes a short context note above the code.
              </p>
            </div>

            {currentProject ? (
              <>
                <div className="overflow-hidden rounded-xl border border-border">
                  <div className="bg-muted/40 flex items-center justify-between border-b border-border px-4 py-2.5">
                    <span className="text-muted-foreground truncate text-xs font-medium tracking-wider uppercase">
                      {currentProject.name}
                    </span>
                    <span className="text-muted-foreground shrink-0 pl-3 text-xs tabular-nums">
                      {exportPreview.split("\n").length} lines
                    </span>
                  </div>
                  <pre className="scrollbar-slim text-muted-foreground max-h-64 overflow-y-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                    {exportPreview}
                  </pre>
                </div>

                <Button
                  onClick={() =>
                    handleCopy(
                      `Here is my current project progress for "${currentProject.name}":\n\n${exportPreview}\n\nPlease suggest improvements and return the updated project code.`,
                      "export"
                    )
                  }
                  className="w-full gap-2"
                >
                  {copiedExport ? <Check /> : <ArrowUpFromLine />}
                  {copiedExport ? "Copied to clipboard" : "Copy for AI chat"}
                </Button>
              </>
            ) : (
              <p className="text-muted-foreground rounded-xl border border-dashed border-border p-6 text-center text-sm">
                Create a project first — there&apos;s nothing to export yet.
              </p>
            )}

            <div className="mt-auto border-t border-border pt-4">
              <p className="text-muted-foreground mb-2 text-xs">
                If the AI forgot the format, re-share the Creator Prompt:
              </p>
              <Button
                variant="outline"
                onClick={() => handleCopy(creatorPrompt, "creator")}
                className="w-full gap-2"
              >
                {copiedCreator ? <Check /> : <Zap />}
                {copiedCreator ? "Copied!" : "Copy Creator Prompt"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
