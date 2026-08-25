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
  Plus,
} from "lucide-react"
import { INSTRUCTIONS_PROMPTS } from "@/lib/prompts"
import { useMemo, useState } from "react"
import { useProjectStore } from "@/store/projectStore"
import { ImportData } from "@/lib/types"
import { toast } from "sonner"
import { LogoMark } from "@/components/Logo"

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
  // Open project → straight into Refine. No project → first-run chooser
  // (Start with AI / Create manually), then the New wizard on demand.
  const [enteredNew, setEnteredNew] = useState(false)
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
      setEnteredNew(false)
      setStep(1)
      setCopied(false)
      setJustCopied(false)
    }
  }

  // null route = first-run chooser (only reachable without a project)
  const route: Route | null = currentProject
    ? "refine"
    : enteredNew
      ? "new"
      : null

  function enterNewWizard() {
    setEnteredNew(true)
    setStep(1)
    setCopied(false)
    setJustCopied(false)
  }

  function backToChooser() {
    setEnteredNew(false)
    setStep(1)
    setCopied(false)
    setJustCopied(false)
  }

  function createManually() {
    onClose()
    window.dispatchEvent(new CustomEvent("c2c:new-project"))
  }

  const activeRoute: Route = route ?? "new"
  const steps = STEPS_BY_ROUTE[activeRoute]

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

  const payload = activeRoute === "new" ? INSTRUCTIONS_PROMPTS : exportMessage

  function handleCopy() {
    navigator.clipboard.writeText(payload)
    setCopied(true)
    setJustCopied(true)
    window.setTimeout(() => setJustCopied(false), 1600)
  }

  const handleImport = () => {
    if (activeRoute === "refine" && !activeProjectId) return

    try {
      setImportError(null)

      if (!importText.trim()) {
        setImportError("Paste the Canvas Code first.")
        return
      }

      const jsonMatch = importText.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        setImportError(
          "No Canvas Code found in your paste — make sure you copied your AI's full reply."
        )
        return
      }

      const data: ImportData = JSON.parse(jsonMatch[0])

      if (!data.name || !Array.isArray(data.columns)) {
        setImportError(
          "This Canvas Code is incomplete — it needs a project name and columns."
        )
        return
      }

      if (activeRoute === "refine" && currentProject) {
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
                {route === "refine"
                  ? "Refine with AI"
                  : route === "new"
                    ? "Plan with AI"
                    : "Canvas Tools"}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-sm">
                {route === "refine"
                  ? `Share “${currentProject?.name}” with your AI and bring back improvements.`
                  : route === "new"
                    ? "Two steps: send the prompt to your AI, bring back its reply."
                    : "Bring any AI chat into your canvas in two steps."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* ── First-run chooser (no open project) ───────────────────────── */}
        {!route ? (
          <div className="flex min-h-[380px] flex-1 flex-col items-center justify-center gap-6 p-8 text-center">
            <LogoMark className="text-muted-foreground/40 size-14" />

            <div className="space-y-1.5">
              <h3 className="font-display text-xl font-semibold tracking-tight">
                Start your first project
              </h3>
              <p className="text-muted-foreground mx-auto max-w-sm text-sm leading-relaxed">
                Plan it together with an AI chat, or set up sections and cards
                yourself — you can always refine with AI later.
              </p>
            </div>

            <div className="flex w-full max-w-xs flex-col gap-2 pt-1">
              <Button onClick={enterNewWizard} className="h-11 gap-2">
                <Zap className="size-4" />
                Start with AI
              </Button>
              <Button variant="outline" onClick={createManually} className="h-11 gap-2">
                <Plus className="size-4" />
                Create manually
              </Button>
            </div>

            <p className="text-muted-foreground/60 max-w-xs text-xs leading-relaxed">
              Not sure how it works? “Start with AI” walks you through copying a
              prompt into ChatGPT or Claude.
            </p>
          </div>
        ) : (
          <>
            {/* ── Stepper ─────────────────────────────────────────────── */}
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
                    <h3 className="text-base font-semibold tracking-tight">
                      {activeRoute === "refine"
                        ? "Share your progress"
                        : "Send the Creator Prompt"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {activeRoute === "refine"
                        ? "This snapshot contains your whole board — sections, cards, tags, and progress."
                        : "Copy this into ChatGPT or Claude, then describe the idea you're planning."}
                    </p>
                  </div>

                  {/* Payload block */}
                  <div className="overflow-hidden rounded-xl border border-border shadow-sm">
                    <div className="bg-muted/40 flex items-center justify-between gap-3 border-b border-border px-4 py-3">
                      <span className="min-w-0 truncate text-xs font-semibold uppercase tracking-wider">
                        {activeRoute === "new" ? (
                          "Creator Prompt"
                        ) : (
                          <>
                            Export package ·{" "}
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

                      <Button
                        size="sm"
                        variant={copied ? "outline" : "default"}
                        onClick={handleCopy}
                        className={`h-8 shrink-0 gap-1.5 px-3 text-xs ${
                          copied ? "border-success/40 text-success" : ""
                        }`}
                      >
                        {justCopied || copied ? (
                          <>
                            <Check /> Copied
                          </>
                        ) : (
                          <>
                            <Copy /> Copy
                          </>
                        )}
                      </Button>
                    </div>

                    <pre className="scrollbar-slim text-muted-foreground max-h-64 overflow-y-auto p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
                      {payload}
                    </pre>
                  </div>

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
                          Copied! Switch to ChatGPT or Claude, paste it, and send.
                          Come back here with the reply.
                        </span>
                      </>
                    ) : (
                      <>
                        <Zap className="mt-0.5 size-4 shrink-0" />
                        <span>
                          {activeRoute === "refine"
                            ? "Your AI reads this snapshot and replies with updated Canvas Code for the whole board."
                            : "Tell it about your project — it will reply with structured Canvas Code."}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {!currentProject && (
                      <Button variant="ghost" onClick={backToChooser} className="gap-2">
                        <ArrowLeft />
                        Start screen
                      </Button>
                    )}
                    <Button
                      onClick={() => setStep(2)}
                      className={`h-10 gap-2 text-sm ${
                        currentProject ? "w-full" : "ml-auto px-6"
                      }`}
                    >
                      {copied ? "Next — paste the reply" : "Next"}
                      <ArrowRight />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Zone heading */}
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold tracking-tight">
                      {activeRoute === "refine"
                        ? "Paste the updated Canvas Code"
                        : "Paste your AI's reply"}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {activeRoute === "refine"
                        ? `The code replaces “${currentProject?.name}”'s sections and cards — its name and settings stay.`
                        : "Drop the Canvas Code below — code fences and any extra chat around it are fine, we'll find the code."}
                    </p>
                  </div>

                  <textarea
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
                      {activeRoute === "refine" ? "Update project" : "Import project"}
                      <ArrowRight />
                    </Button>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
