'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Zap,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Download,
  Upload,
} from "lucide-react"
import { INSTRUCTIONS_PROMPTS } from "@/lib/prompts"
import { useMemo, useState } from "react"
import { useProjectStore } from "@/store/projectStore"
import { ImportData } from "@/lib/types"
import { toast } from "sonner"

interface AIToolsModalProps {
  open: boolean
  onClose: () => void
}

type Route = "refine" | "new"

const STEPS_BY_ROUTE: Record<Route, { n: 1 | 2; label: string }[]> = {
  refine: [
    { n: 1, label: "Share your progress" },
    { n: 2, label: "Bring it back" },
  ],
  new: [
    { n: 1, label: "Send to your AI" },
    { n: 2, label: "Bring it back" },
  ],
}

export default function AIToolsModal({ open, onClose }: AIToolsModalProps) {
  const projects = useProjectStore((state) => state.projects)
  const activeProjectId = useProjectStore((state) => state.activeProjectId)
  const importProject = useProjectStore((state) => state.importProject)
  const updateProjectFromImport = useProjectStore(
    (state) => state.updateProjectFromImport
  )

  const currentProject = projects.find((p) => p.id === activeProjectId)

  // ── Routing: context decides ──────────────────────────────────────────
  // Open project → Refine. No project → New wizard.
  const [step, setStep] = useState<1 | 2>(1)
  const [copied, setCopied] = useState(false)
  const [justCopied, setJustCopied] = useState(false)

  const [importText, setImportText] = useState("")
  const [importError, setImportError] = useState<string | null>(null)

  // Fresh journey on every open (paste draft intentionally survives).
  // Render-time state adjustment — no effect needed.
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) {
      setStep(1)
      setCopied(false)
      setJustCopied(false)
    }
  }

  const route: Route = currentProject ? "refine" : "new"
  const steps = STEPS_BY_ROUTE[route]

  // Export package preview (what gets copied back to the AI chat)
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
            isDone: card.isDone,
            ...(card.description ? { description: card.description } : {}),
            tasks: card.tasks,
            ...(card.tags?.length ? { tags: card.tags } : {}),
          })),
        })),
      },
      null,
      2
    )
  }, [currentProject])

  const exportMessage = useMemo(() => {
    if (!currentProject) return ""
    return `Here is my current project "${currentProject.name}". Please improve it and reply with the full updated Canvas Code.\n\n${exportPreview}`
  }, [currentProject, exportPreview])

  const payload = route === "new" ? INSTRUCTIONS_PROMPTS : exportMessage

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(payload)
      setCopied(true)
      setJustCopied(true)
      window.setTimeout(() => setJustCopied(false), 1600)
    } catch {
      toast.error("Failed to copy — try selecting the text manually")
    }
  }

  function handleDownload() {
    const blob = new Blob([payload], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = route === "refine"
      ? `${currentProject?.name ?? "project"}.json`
      : "creator-prompt.json"
    a.click()
    URL.revokeObjectURL(url)
    toast.success("File downloaded")
  }

  function handleFileImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setImportText(reader.result as string)
      if (importError) setImportError(null)
    }
    reader.readAsText(file)
    e.target.value = ""
  }

  const handleImport = () => {
    if (route === "refine" && !activeProjectId) return

    try {
      setImportError(null)

      if (!importText.trim()) {
        setImportError("Paste the Canvas Code first.")
        return
      }

      // Extract the first complete JSON object from the paste (handles
      // markdown fences, extra chat text, and nested braces).
      let jsonStr = ""
      const start = importText.indexOf("{")
      if (start !== -1) {
        let depth = 0
        for (let i = start; i < importText.length; i++) {
          if (importText[i] === "{") depth++
          else if (importText[i] === "}") depth--
          if (depth === 0) {
            jsonStr = importText.slice(start, i + 1)
            break
          }
        }
      }

      if (!jsonStr) {
        setImportError(
          "No Canvas Code found in your paste — make sure you copied your AI's full reply."
        )
        return
      }

      const data: ImportData = JSON.parse(jsonStr)

      if (!data.name || !Array.isArray(data.columns)) {
        setImportError(
          "This Canvas Code is incomplete — it needs a project name and columns."
        )
        return
      }

      if (route === "refine" && currentProject) {
        updateProjectFromImport(currentProject.id, data)
        onClose()
        toast.success(`"${currentProject.name}" updated`)
      } else {
        importProject(data)
        onClose()
        toast.success(`"${data.name}" imported`)
      }
    } catch {
      setImportError(
        "We couldn't read this Canvas Code. Copy your AI's complete reply and try again."
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="
          flex flex-col gap-0 overflow-hidden p-0
          w-full max-w-[calc(100vw-1rem)] sm:max-w-[680px]
          max-h-[92vh]
          rounded-none sm:rounded-xl border-0 sm:border
        "
      >
        {/* Header */}
        <DialogHeader className="shrink-0 gap-0 border-b border-border px-7 pt-6 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="bg-primary/12 text-primary shadow-xs flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
              <Zap className="size-5" />
            </div>
            <div className="flex flex-col gap-1">
              <DialogTitle className="text-xl font-semibold tracking-tight">
                {route === "refine" ? "Refine with AI" : "Plan with AI"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {route === "refine"
                  ? `Share "${currentProject?.name}" with your AI and bring back improvements.`
                  : "Two steps: send the prompt to your AI, bring back its reply."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── Stepper ─────────────────────────────────────────────────── */}
        <nav
              aria-label="Wizard progress"
              className="flex shrink-0 items-center gap-2 border-b border-border px-7 py-3.5"
            >
              {steps.map((s, i) => {
                const isActive = step === s.n
                const isDone = s.n === 1 && copied && !isActive

                return (
                  <div
                    key={s.n}
                    className="flex min-w-0 flex-1 items-center gap-2.5"
                  >
                    {i > 0 && (
                      <span
                        aria-hidden
                        className={`h-px flex-1 ${step === 2 ? "bg-border-strong" : "bg-border"}`}
                      />
                    )}

                    <button
                      type="button"
                      onClick={() => setStep(s.n)}
                      aria-current={isActive ? "step" : undefined}
                      className={`flex cursor-pointer items-center gap-2 rounded-md py-1 pr-2 text-sm font-medium transition-colors ${
                        isActive
                          ? "text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <span
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold tabular-nums transition-colors ${
                          isActive
                            ? "border-primary bg-primary/12 text-primary"
                            : isDone
                              ? "border-success bg-success text-background"
                              : "border-border text-muted-foreground"
                        }`}
                      >
                        {isDone ? (
                          <Check className="size-3.5 stroke-[3]" />
                        ) : (
                          s.n
                        )}
                      </span>
                      <span
                        className={`truncate ${isActive ? "" : "hidden sm:inline"}`}
                      >
                        {s.label}
                      </span>
                    </button>
                  </div>
                )
              })}
            </nav>

            {/* ── Body ──────────────────────────────────────────────────── */}
            <div className="scrollbar-slim min-h-[420px] flex-1 space-y-5 overflow-y-auto p-7">
              {step === 1 ? (
                <>
                  {/* Zone heading */}
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold tracking-tight">
                      {route === "refine"
                        ? "Copy your project"
                        : "Copy the Creator Prompt"}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {route === "refine"
                        ? "Paste this into ChatGPT or Claude — tell it what to improve."
                        : "Paste this into ChatGPT or Claude, then describe the idea you're planning."}
                    </p>
                  </div>

                  {/* Prominent copy button */}
                  <Button
                    onClick={handleCopy}
                    variant={copied ? "outline" : "default"}
                    className={`h-12 w-full gap-2 text-[15px] font-semibold ${
                      copied ? "border-success/40 text-success" : ""
                    }`}
                  >
                    {justCopied || copied ? (
                      <>
                        <Check className="size-5" />
                        Copied to clipboard
                      </>
                    ) : (
                      <>
                        <Copy className="size-5" />
                        {route === "refine"
                          ? "Copy project JSON"
                          : "Copy Creator Prompt"}
                      </>
                    )}
                  </Button>

                  {route === "refine" && (
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="h-10 w-full gap-2 text-sm"
                    >
                      <Download className="size-4" />
                      Download JSON
                    </Button>
                  )}

                  {/* Coach line */}
                  <div
                    role="status"
                    className={`flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm leading-relaxed transition-colors ${
                      copied
                        ? "bg-success/10 text-success"
                        : "text-muted-foreground bg-muted/30"
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="mt-0.5 size-4 shrink-0" />
                        <span>
                          Copied! Switch to your AI, paste it, and send.
                          Come back here with the reply.
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="mt-0.5 size-4 shrink-0" />
                        <span>
                          {route === "refine"
                            ? "Your AI reads this snapshot and replies with updated Canvas Code for the whole board."
                            : "Tell it about your project — it will reply with structured Canvas Code."}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Collapsible payload preview */}
                  <details className="group">
                    <summary className="text-muted-foreground hover:text-foreground cursor-pointer text-xs font-medium transition-colors">
                      Preview payload
                    </summary>
                    <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                      <div className="bg-muted/40 flex items-center gap-3 border-b border-border px-4 py-2.5">
                        <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wider">
                          {route === "new" ? (
                            "Creator Prompt"
                          ) : (
                            <>
                              Export ·{" "}
                              <span className="normal-case">
                                {currentProject?.name}
                              </span>
                              {" · "}
                              <span className="normal-case tabular-nums">
                                {exportPreview.split("\n").length} lines
                              </span>
                            </>
                          )}
                        </span>
                      </div>
                      <pre className="scrollbar-slim text-muted-foreground max-h-56 overflow-y-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                        {payload}
                      </pre>
                    </div>
                  </details>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      onClick={() => setStep(2)}
                      className="h-10 w-full gap-2 text-sm"
                    >
                      Next — paste the reply
                      <ArrowRight />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Zone heading */}
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">
                      {route === "refine"
                        ? "Paste the updated Canvas Code"
                        : "Paste your AI's reply"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {route === "refine"
                        ? `The code replaces “${currentProject?.name}”'s sections and cards — its name and settings stay.`
                        : "Drop the Canvas Code below — code fences and any extra chat around it are fine, we'll find the code."}
                    </p>
                  </div>

                  <textarea
                    aria-label="Paste Canvas Code from your AI"
                    value={importText}
                    onChange={(e) => {
                      setImportText(e.target.value)
                      if (importError) setImportError(null)
                    }}
                    spellCheck={false}
                    className={`scrollbar-slim placeholder:text-muted-foreground/70 focus-visible:ring-ring/60 h-64 w-full resize-none rounded-xl border bg-background p-4 font-mono text-xs leading-relaxed transition-colors focus-visible:ring-2 focus-visible:outline-none ${
                      importError
                        ? "border-destructive focus-visible:ring-destructive/50"
                        : "border-input"
                    }`}
                    placeholder={`{\n  "name": "My Project",\n  "columns": [\n    { "title": "Design", "color": "oklch(…)", "cards": [ … ] }\n  ]\n}`}
                  />

                  {importError && (
                    <p
                      role="alert"
                      className="bg-destructive/10 text-destructive flex items-start gap-2 rounded-lg px-3.5 py-2.5 text-sm"
                    >
                      {importError}
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <label className="bg-muted/50 hover:bg-muted flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors">
                      <Upload className="size-4" />
                      Upload .json
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleFileImport}
                        className="sr-only"
                      />
                    </label>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="ghost"
                      onClick={() => setStep(1)}
                      className="h-10 gap-2"
                    >
                      <ArrowLeft />
                      Back
                    </Button>

                    <Button
                      onClick={handleImport}
                      disabled={!importText.trim()}
                      className="ml-auto h-10 flex-1 gap-2 text-sm disabled:cursor-not-allowed sm:max-w-56"
                    >
                      {route === "refine" ? "Update project" : "Import project"}
                      <ArrowRight />
                    </Button>
                  </div>
                </>
              )}
            </div>
      </DialogContent>
    </Dialog>
  )
}
