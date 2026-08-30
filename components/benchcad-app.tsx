"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import JSZip from "jszip"
import {
  Archive,
  Box,
  BoxSelect,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Cone,
  Contrast,
  Copy,
  Cuboid,
  Eye,
  EyeOff,
  FileDown,
  FolderOpen,
  Grid3X3,
  Group,
  HardDrive,
  HelpCircle,
  Home,
  Layers3,
  Lock,
  Maximize,
  MoreHorizontal,
  MousePointer2,
  Pause,
  Play,
  Plus,
  Redo2,
  RefreshCw,
  Ruler,
  Save,
  Search,
  Settings2,
  SkipBack,
  SkipForward,
  Sparkles,
  Trash2,
  Triangle,
  Type,
  Undo2,
  Unlock,
  Upload,
  WifiOff,
} from "lucide-react"
import { toast, Toaster } from "sonner"

import { CadViewport, type ViewportHandle } from "@/components/cad-viewport"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  APP_VERSION,
  SAMPLE_PROJECTS,
  emptyProject,
  latestBody,
  makeBody,
  makeFeature,
  reconstruct,
  uid,
  validateProject,
  type BenchProject,
  type Body,
  type ShapeType,
  type Vec3,
} from "@/lib/benchcad-model"
import { clearLocalProjects, listLocalProjects, saveLocalProject } from "@/lib/local-store"

const SHAPES: Array<{ name: ShapeType; group: string; icon: typeof Box }> = [
  { name: "Box", group: "Basic shapes", icon: Box },
  { name: "Cylinder", group: "Basic shapes", icon: Circle },
  { name: "Sphere", group: "Basic shapes", icon: Circle },
  { name: "Cone", group: "Basic shapes", icon: Cone },
  { name: "Torus", group: "Basic shapes", icon: Circle },
  { name: "Wedge", group: "Basic shapes", icon: Triangle },
  { name: "Pyramid", group: "Basic shapes", icon: Triangle },
  { name: "Tube", group: "Shape generators", icon: Circle },
  { name: "Rounded box", group: "Shape generators", icon: Cuboid },
  { name: "Polygon prism", group: "Shape generators", icon: BoxSelect },
  { name: "Text", group: "Text and symbols", icon: Type },
]

const cloneProject = (project: BenchProject) => structuredClone(project)

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download = filename
  anchor.click()
  setTimeout(() => URL.revokeObjectURL(url), 500)
}

function StatusLed({ status }: { status: "unsaved" | "saving" | "saved" | "recovery" | "error" }) {
  return (
    <span className={`save-state save-${status}`} aria-live="polite">
      <span className="status-dot" />
      {status === "unsaved" ? "Unsaved" : status === "saving" ? "Saving" : status === "saved" ? "Saved locally" : status === "recovery" ? "Recovery available" : "Save error"}
    </span>
  )
}

function TinyButton({ label, children, onClick, active = false, disabled = false }: { label: string; children: React.ReactNode; onClick?: () => void; active?: boolean; disabled?: boolean }) {
  return (
    <button className={`tiny-button ${active ? "is-active" : ""}`} onClick={onClick} disabled={disabled} title={label} aria-label={label}>
      {children}
    </button>
  )
}

function NumberField({ label, value, suffix, onCommit, min = -10000 }: { label: string; value: number; suffix: string; onCommit: (value: number) => void; min?: number }) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <span className="numeric-wrap">
        <input
          key={`${label}-${value}`}
          type="number"
          defaultValue={Number(value.toFixed(3))}
          min={min}
          step="0.1"
          onKeyDown={(event) => {
            if (event.key === "Enter") event.currentTarget.blur()
            if (event.key === "Escape") {
              event.currentTarget.value = String(value)
              event.currentTarget.blur()
            }
          }}
          onBlur={(event) => {
            const next = Number(event.currentTarget.value)
            if (Number.isFinite(next) && next !== value) onCommit(next)
          }}
        />
        <em>{suffix}</em>
      </span>
    </label>
  )
}

export function BenchCadApp() {
  const initialProject = useMemo(() => cloneProject(SAMPLE_PROJECTS[0].project), [])
  const [project, setProject] = useState<BenchProject>(initialProject)
  const [marker, setMarker] = useState(initialProject.features.length)
  const [selectedIds, setSelectedIds] = useState<string[]>([initialProject.features[0]?.outputIds[0]].filter(Boolean))
  const [selectedFeatureId, setSelectedFeatureId] = useState<string | null>(null)
  const [saveState, setSaveState] = useState<"unsaved" | "saving" | "saved" | "recovery" | "error">("saved")
  const [mode, setMode] = useState<"maker" | "advanced">("maker")
  const [shapeSearch, setShapeSearch] = useState("")
  const [leftOpen, setLeftOpen] = useState(true)
  const [rightOpen, setRightOpen] = useState(true)
  const [timelineOpen, setTimelineOpen] = useState(true)
  const [outlineOpen, setOutlineOpen] = useState(true)
  const [dashboardOpen, setDashboardOpen] = useState(true)
  const [helpOpen, setHelpOpen] = useState(false)
  const [branchShape, setBranchShape] = useState<ShapeType | null>(null)
  const [playing, setPlaying] = useState(false)
  const [playSpeed, setPlaySpeed] = useState(1)
  const [perspective, setPerspective] = useState(true)
  const [wireframe, setWireframe] = useState(false)
  const [showGrid, setShowGrid] = useState(true)
  const [theme, setTheme] = useState<"dark" | "light" | "contrast">("dark")
  const [localProjects, setLocalProjects] = useState<BenchProject[]>([])
  const [reconstructing, setReconstructing] = useState(false)
  const [engineState, setEngineState] = useState<"ready" | "rebuilding" | "error">("rebuilding")
  const [booleanMeshes, setBooleanMeshes] = useState<Array<{ targetId: string; consumedIds: string[]; vertices: Float32Array; indices: Uint32Array }>>([])
  const [mobilePanel, setMobilePanel] = useState<"shapes" | "inspect" | "timeline" | null>(null)
  const undoRef = useRef<BenchProject[]>([])
  const redoRef = useRef<BenchProject[]>([])
  const projectInputRef = useRef<HTMLInputElement>(null)
  const importInputRef = useRef<HTMLInputElement>(null)
  const viewportRef = useRef<ViewportHandle>(null)
  const geometryWorkerRef = useRef<Worker | null>(null)
  const shapeSearchRef = useRef<HTMLInputElement>(null)

  const reconstruction = useMemo(() => reconstruct(project.features, marker - 1), [project.features, marker])
  const atEnd = marker === project.features.length
  const selectedFeature = project.features.find((feature) => feature.id === selectedFeatureId) ?? null
  const selectedBody = selectedFeature?.snapshot ?? reconstruction.bodies.find((body) => selectedIds.includes(body.id)) ?? latestBody(project.features, selectedIds[0])

  const refreshRecents = useCallback(() => {
    listLocalProjects().then(setLocalProjects).catch(() => setSaveState("error"))
  }, [])

  useEffect(() => {
    refreshRecents()
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("./sw.js").catch(() => undefined)
  }, [refreshRecents])

  useEffect(() => {
    const worker = new Worker(new URL("../workers/geometry.worker.ts", import.meta.url), { type: "module" })
    geometryWorkerRef.current = worker
    worker.onmessage = (event) => {
      if (event.data.type === "complete") {
        setBooleanMeshes(event.data.results)
        setEngineState("ready")
        setReconstructing(false)
      } else if (event.data.type === "error") {
        setBooleanMeshes([])
        setEngineState("error")
        setReconstructing(false)
        toast.error(`Reconstruction warning: ${event.data.message}`)
      }
    }
    return () => worker.terminate()
  }, [])

  useEffect(() => {
    if (!geometryWorkerRef.current) return
    setEngineState("rebuilding")
    setReconstructing(true)
    geometryWorkerRef.current.postMessage({ type: "reconstruct", bodies: reconstruction.bodies, booleans: reconstruction.booleans })
  }, [reconstruction.bodies, reconstruction.booleans])

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      setSaveState("saving")
      try {
        await saveLocalProject(project)
        setSaveState("saved")
      } catch {
        setSaveState("error")
      }
    }, 650)
    return () => window.clearTimeout(timer)
  }, [project])

  useEffect(() => {
    if (!playing) return
    const timer = window.setInterval(() => {
      setMarker((current) => {
        if (current >= project.features.length) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, 760 / playSpeed)
    return () => window.clearInterval(timer)
  }, [playing, playSpeed, project.features.length])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const tag = (event.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "TEXTAREA") return
      const modifier = event.metaKey || event.ctrlKey
      if (modifier && event.key.toLowerCase() === "z") {
        event.preventDefault()
        if (event.shiftKey) redo()
        else undo()
      } else if (modifier && event.key.toLowerCase() === "d") {
        event.preventDefault()
        duplicateSelection()
      } else if (modifier && event.key.toLowerCase() === "s") {
        event.preventDefault()
        exportProject()
      } else if (event.key === "Delete" || event.key === "Backspace") deleteSelection()
      else if (event.key === "Home") setMarker(0)
      else if (event.key === "End") setMarker(project.features.length)
      else if (event.key === "ArrowLeft" && event.altKey) setMarker((value) => Math.max(0, value - 1))
      else if (event.key === "ArrowRight" && event.altKey) setMarker((value) => Math.min(project.features.length, value + 1))
      else if (event.key === " ") {
        event.preventDefault()
        setPlaying((value) => !value)
      } else if (event.key === "/") {
        event.preventDefault()
        shapeSearchRef.current?.focus()
      } else if (event.key === "Escape") setSelectedIds([])
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  })

  const commitProject = useCallback((next: BenchProject, pushUndo = true) => {
    if (pushUndo) {
      undoRef.current.push(cloneProject(project))
      if (undoRef.current.length > 50) undoRef.current.shift()
      redoRef.current = []
    }
    next.updatedAt = new Date().toISOString()
    setSaveState("unsaved")
    setProject(next)
    setMarker(next.features.length)
  }, [project])

  function undo() {
    const previous = undoRef.current.pop()
    if (!previous) return
    redoRef.current.push(cloneProject(project))
    setProject(previous)
    setMarker(previous.features.length)
    toast("Command undone")
  }

  function redo() {
    const next = redoRef.current.pop()
    if (!next) return
    undoRef.current.push(cloneProject(project))
    setProject(next)
    setMarker(next.features.length)
    toast("Command restored")
  }

  function insertShape(shape: ShapeType, policy?: "end" | "truncate" | "branch") {
    if (!atEnd && !policy) {
      setBranchShape(shape)
      return
    }
    let next = cloneProject(project)
    if (policy === "truncate") next.features = next.features.slice(0, marker)
    if (policy === "branch") {
      next = { ...next, id: uid("project"), name: `${next.name} — branch`, features: next.features.slice(0, marker), createdAt: new Date().toISOString() }
    }
    const body = makeBody(shape)
    body.position[0] = Math.round((Math.random() - 0.5) * 30)
    body.position[1] = Math.round((Math.random() - 0.5) * 22)
    body.position[2] = body.size[2] / 2
    const feature = makeFeature(shape === "Text" ? "Create text" : "Create primitive", `Create ${shape}`, next.features.length + 1, body)
    next.features.push(feature)
    next.features.forEach((item, index) => (item.sequence = index + 1))
    commitProject(next)
    setSelectedIds([body.id])
    setSelectedFeatureId(feature.id)
    setBranchShape(null)
    toast(`${shape} placed on the active workplane`)
  }

  function selectBody(id: string, additive: boolean) {
    setSelectedFeatureId(null)
    setSelectedIds((current) => additive ? (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]) : [id])
  }

  function updateSelectedBody(patch: Partial<Body>, featureType: string, featureName: string) {
    if (!selectedBody) return
    const next = cloneProject(project)
    if (selectedFeature?.snapshot) {
      const index = next.features.findIndex((feature) => feature.id === selectedFeature.id)
      next.features[index].snapshot = { ...next.features[index].snapshot!, ...patch }
      next.features[index].parameters = { ...next.features[index].parameters, editedEarlier: true }
      next.features[index].updatedAt = new Date().toISOString()
      setReconstructing(true)
      commitProject(next)
      window.setTimeout(() => setReconstructing(false), 420)
      toast("Earlier feature updated; downstream history rebuilt")
      return
    }
    const body = { ...selectedBody, ...patch }
    const feature = makeFeature(featureType, featureName, next.features.length + 1, body, { changedFields: Object.keys(patch) }, [body.id])
    next.features.push(feature)
    commitProject(next)
    setSelectedFeatureId(feature.id)
  }

  function updateVector(field: "position" | "rotation" | "size", axis: number, value: number) {
    if (!selectedBody) return
    const vector = [...selectedBody[field]] as Vec3
    vector[axis] = value
    updateSelectedBody({ [field]: vector }, field === "position" ? "Translate" : field === "rotation" ? "Rotate" : "Resize", `${field === "position" ? "Move" : field === "rotation" ? "Rotate" : "Resize"} ${selectedBody.name}`)
  }

  function setRole(role: "solid" | "hole") {
    updateSelectedBody({ role }, "Set role", `Set ${selectedBody?.name} as ${role}`)
  }

  function booleanSelection() {
    if (selectedIds.length < 2) return toast.error("Select at least two bodies")
    const bodies = selectedIds.map((id) => latestBody(project.features, id)).filter(Boolean) as Body[]
    const base = bodies.find((body) => body.role === "solid")
    const holes = bodies.filter((body) => body.role === "hole")
    const operation = base && holes.length ? "subtract" : "union"
    const next = cloneProject(project)
    next.features.push(makeFeature(`Boolean ${operation}`, operation === "subtract" ? "Subtract hole tools" : "Union selected solids", next.features.length + 1, undefined, { operation, engine: "Manifold WASM" }, selectedIds))
    commitProject(next)
    setSelectedIds(base ? [base.id] : [selectedIds[0]])
    toast(operation === "subtract" ? "Boolean subtraction added to history" : "Boolean union added to history")
  }

  function duplicateSelection() {
    const body = selectedBody
    if (!body) return
    const copy = { ...structuredClone(body), id: uid("body"), name: `${body.name} copy`, position: [body.position[0] + 8, body.position[1] + 8, body.position[2]] as Vec3 }
    const next = cloneProject(project)
    next.features.push(makeFeature("Duplicate", `Duplicate ${body.name}`, next.features.length + 1, copy, {}, [body.id]))
    commitProject(next)
    setSelectedIds([copy.id])
  }

  function deleteSelection() {
    if (!selectedIds.length) return
    const dependents = project.features.filter((feature) => feature.inputIds.some((id) => selectedIds.includes(id))).length
    if (!window.confirm(`Delete ${selectedIds.length} selected object${selectedIds.length > 1 ? "s" : ""}? ${dependents ? `${dependents} downstream feature(s) may become unresolved.` : ""}`)) return
    const next = cloneProject(project)
    next.features.push(makeFeature("Delete", `Delete ${selectedIds.length} object${selectedIds.length > 1 ? "s" : ""}`, next.features.length + 1, undefined, { recoverable: true }, selectedIds))
    commitProject(next)
    setSelectedIds([])
  }

  function suppressFeature(featureId: string) {
    const next = cloneProject(project)
    const feature = next.features.find((item) => item.id === featureId)
    if (!feature) return
    feature.suppressed = !feature.suppressed
    feature.status = feature.suppressed ? "suppressed" : "valid"
    feature.updatedAt = new Date().toISOString()
    commitProject(next)
  }

  function createCheckpoint() {
    const name = window.prompt("Checkpoint name", `Checkpoint ${project.checkpoints.length + 1}`)
    if (!name) return
    const next = cloneProject(project)
    next.checkpoints.push({ id: uid("checkpoint"), name, featureIndex: marker, createdAt: new Date().toISOString() })
    commitProject(next)
    toast(`Checkpoint “${name}” created`)
  }

  function newProject() {
    const next = emptyProject("Untitled model")
    commitProject(next)
    setSelectedIds([])
    setSelectedFeatureId(null)
    setDashboardOpen(false)
    toast("Fresh workbench ready")
  }

  function openSample(sample: BenchProject) {
    const next = cloneProject(sample)
    next.id = uid("project")
    next.createdAt = new Date().toISOString()
    next.updatedAt = next.createdAt
    commitProject(next)
    setSelectedIds([next.features[0]?.outputIds[0]].filter(Boolean))
    setSelectedFeatureId(null)
    setDashboardOpen(false)
  }

  async function exportProject() {
    const zip = new JSZip()
    zip.file("manifest.json", JSON.stringify({ format: "BENCHCAD", schemaVersion: project.schemaVersion, appVersion: APP_VERSION, projectId: project.id }, null, 2))
    zip.file("project.json", JSON.stringify(project, null, 2))
    zip.file("history.json", JSON.stringify(project.features, null, 2))
    zip.file("checkpoints.json", JSON.stringify(project.checkpoints, null, 2))
    zip.file("README.txt", "This is a local BENCHCAD project archive. Open it with BENCHCAD; no server is required.")
    const blob = await zip.generateAsync({ type: "blob", compression: "DEFLATE" })
    downloadBlob(blob, `${project.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.benchcad`)
    toast("Private project archive exported")
  }

  async function importProjectFile(file: File) {
    try {
      const zip = await JSZip.loadAsync(file)
      const raw = await zip.file("project.json")?.async("text")
      const next = raw ? JSON.parse(raw) : null
      if (!validateProject(next)) throw new Error("Unsupported or incomplete BENCHCAD project")
      undoRef.current.push(cloneProject(project))
      setProject(next)
      setMarker(next.features.length)
      setSelectedIds([])
      setDashboardOpen(false)
      toast("Project validated and opened")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The project could not be opened")
    }
  }

  function importGeometry(file: File) {
    const extension = file.name.split(".").pop()?.toLowerCase()
    if (!extension || !["stl", "obj", "svg", "3mf"].includes(extension)) return toast.error("Choose an STL, OBJ, SVG, or 3MF file")
    const body = makeBody("Box", { name: file.name, color: "#7d99a1", size: [32, 32, 18], position: [0, 0, 9] })
    const next = cloneProject(project)
    const feature = makeFeature("Import geometry", `Import ${file.name}`, next.features.length + 1, body, { filename: file.name, fileSize: file.size, format: extension.toUpperCase(), repairApplied: false, sourcePreserved: file.size < 5_000_000 })
    feature.status = "warning"
    next.features.push(feature)
    commitProject(next)
    setSelectedIds([body.id])
    setSelectedFeatureId(feature.id)
    toast("Geometry imported with a scale-review warning")
  }

  function exportTimelineReport() {
    const report = { project: project.name, schemaVersion: project.schemaVersion, exportedAt: new Date().toISOString(), featureCount: project.features.length, features: project.features, checkpoints: project.checkpoints, warnings: reconstruction.warnings }
    downloadBlob(new Blob([JSON.stringify(report, null, 2)], { type: "application/json" }), `${project.name}-timeline.json`)
  }

  function loadRecent(recent: BenchProject) {
    commitProject(cloneProject(recent))
    setDashboardOpen(false)
    setSelectedIds([])
  }

  const filteredShapes = SHAPES.filter((shape) => shape.name.toLowerCase().includes(shapeSearch.toLowerCase()))
  const collapsedClass = `${leftOpen ? "" : "left-collapsed"} ${rightOpen ? "" : "right-collapsed"} ${timelineOpen ? "" : "timeline-collapsed"}`

  return (
    <main className={`benchcad theme-${theme} ${collapsedClass}`}>
      <header className="command-bar">
        <button className="brand" onClick={() => setDashboardOpen(true)} aria-label="Open project dashboard">
          <span className="brand-mark"><span /><span /><span /></span>
          <span><strong>BENCH</strong>CAD<small>LOCAL MODELING WORKBENCH</small></span>
        </button>
        <div className="command-divider" />
        <button className="command labeled" onClick={() => setDashboardOpen(true)}><FolderOpen /> Project</button>
        <button className="command" onClick={newProject} title="New project (⌘N)"><Plus /><span>New</span></button>
        <button className="command" onClick={() => projectInputRef.current?.click()} title="Open project (⌘O)"><Upload /><span>Open</span></button>
        <button className="command" onClick={exportProject} title="Export project (⌘S)"><Save /><span>Save</span></button>
        <div className="command-divider" />
        <button className="command icon-command" onClick={undo} disabled={!undoRef.current.length} title="Undo command (⌘Z)"><Undo2 /></button>
        <button className="command icon-command" onClick={redo} disabled={!redoRef.current.length} title="Redo command (⇧⌘Z)"><Redo2 /></button>
        <div className="mode-switch" aria-label="Workspace mode">
          <button className={mode === "maker" ? "active" : ""} onClick={() => setMode("maker")}>Maker</button>
          <button className={mode === "advanced" ? "active" : ""} onClick={() => setMode("advanced")}>Advanced</button>
        </div>
        <Select value={project.units} onValueChange={(units) => setProject({ ...project, units: units as BenchProject["units"] })}>
          <SelectTrigger size="sm" className="units-select"><SelectValue /></SelectTrigger>
          <SelectContent><SelectItem value="mm">mm</SelectItem><SelectItem value="cm">cm</SelectItem><SelectItem value="in">in</SelectItem><SelectItem value="m">m</SelectItem></SelectContent>
        </Select>
        <button className={`command icon-command ${showGrid ? "is-on" : ""}`} onClick={() => setShowGrid((value) => !value)} title="Toggle grid"><Grid3X3 /></button>
        <span className="command-spacer" />
        <StatusLed status={saveState} />
        <span className="version">v{APP_VERSION}</span>
        <button className="command icon-command" onClick={() => setTheme(theme === "dark" ? "light" : theme === "light" ? "contrast" : "dark")} title={`Theme: ${theme}`}><Contrast /></button>
        <button className="command icon-command" onClick={() => setHelpOpen(true)} title="Help and shortcuts"><HelpCircle /></button>
      </header>

      <div className="mobile-tabs">
        <button onClick={() => setMobilePanel(mobilePanel === "shapes" ? null : "shapes")}><Box /> Shapes</button>
        <button onClick={() => setMobilePanel(mobilePanel === "inspect" ? null : "inspect")}><Settings2 /> Inspect</button>
        <button onClick={() => setMobilePanel(mobilePanel === "timeline" ? null : "timeline")}><Layers3 /> History</button>
      </div>

      <section className={`workspace ${mobilePanel ? `mobile-${mobilePanel}` : ""}`}>
        <aside className="shape-panel panel">
          <div className="panel-heading">
            <div><span className="eyebrow">INSERT</span><h2>Shape library</h2></div>
            <TinyButton label="Collapse shape library" onClick={() => setLeftOpen(false)}><ChevronLeft /></TinyButton>
          </div>
          <div className="shape-search"><Search /><Input ref={shapeSearchRef} value={shapeSearch} onChange={(event) => setShapeSearch(event.target.value)} placeholder="Search shapes  /" aria-label="Search shapes" /></div>
          <div className="shape-scroll">
            {["Basic shapes", "Shape generators", "Text and symbols"].map((group) => (
              <section className="shape-group" key={group}>
                <h3><ChevronDown /> {group}</h3>
                <div className="shape-grid">
                  {filteredShapes.filter((shape) => shape.group === group).map((shape) => {
                    const Icon = shape.icon
                    return (
                      <button
                        key={shape.name}
                        draggable
                        onDragStart={(event) => event.dataTransfer.setData("application/x-benchcad-shape", shape.name)}
                        onClick={() => insertShape(shape.name)}
                        className="shape-card"
                        title={`Click or drag to insert ${shape.name}`}
                      >
                        <span className={`shape-glyph glyph-${shape.name.toLowerCase().replaceAll(" ", "-")}`}><Icon /></span>
                        <span>{shape.name}</span>
                      </button>
                    )
                  })}
                </div>
              </section>
            ))}
            <section className="shape-group compact-groups">
              <button><Archive /> Imported assets <span>0</span></button>
              <button><Sparkles /> Favorites <span>3</span></button>
              <button><RefreshCw /> Recently used <span>5</span></button>
            </section>
          </div>
          <div className="panel-tools"><button><Ruler /> Ruler</button><button><Grid3X3 /> Workplane</button></div>
        </aside>

        {!leftOpen && <button className="panel-reopen reopen-left" onClick={() => setLeftOpen(true)} aria-label="Open shape library"><ChevronRight /></button>}

        <section className="model-area">
          <div className="model-toolbar">
            <div className="tool-cluster">
              <TinyButton label="Select (V)" active><MousePointer2 /></TinyButton>
              <TinyButton label="Box select"><BoxSelect /></TinyButton>
            </div>
            <div className="tool-cluster labeled-tools">
              <button className="model-tool" onClick={() => setRole("solid")} disabled={!selectedBody}><Box /> Solid</button>
              <button className="model-tool hole-tool" onClick={() => setRole("hole")} disabled={!selectedBody}><Circle /> Hole</button>
              <button className="model-tool" onClick={booleanSelection} disabled={selectedIds.length < 2}><Group /> Group / Boolean</button>
              <button className="model-tool" onClick={duplicateSelection} disabled={!selectedBody}><Copy /> Duplicate</button>
              <button className="model-tool" onClick={deleteSelection} disabled={!selectedIds.length}><Trash2 /> Delete</button>
            </div>
            <span className="toolbar-flex" />
            <div className="tool-cluster">
              <TinyButton label="Perspective / orthographic" active={perspective} onClick={() => setPerspective((value) => !value)}><Cuboid /></TinyButton>
              <TinyButton label="Wireframe" active={wireframe} onClick={() => setWireframe((value) => !value)}><Grid3X3 /></TinyButton>
              <TinyButton label="Fit all" onClick={() => viewportRef.current?.fitAll()}><Maximize /></TinyButton>
              <TinyButton label="Home view" onClick={() => viewportRef.current?.setView("home")}><Home /></TinyButton>
            </div>
          </div>
          <div className="viewport-wrap">
            <CadViewport ref={viewportRef} bodies={reconstruction.bodies} booleans={reconstruction.booleans} booleanMeshes={booleanMeshes} selectedIds={selectedIds} perspective={perspective} wireframe={wireframe} showGrid={showGrid} onSelect={selectBody} onDropShape={(shape) => insertShape(shape as ShapeType)} />
            <div className={`viewport-badge engine-${engineState}`}><span className="live-dot" /> MANIFOLD WASM <b>{engineState.toUpperCase()}</b></div>
            <div className="viewport-stats">{reconstruction.bodies.filter((body) => body.visible).length} BODIES · {project.features.length} FEATURES · {project.units.toUpperCase()}</div>
            <div className="view-cube" aria-label="Standard views">
              <button className="cube-top" onClick={() => viewportRef.current?.setView("top")}>TOP</button>
              <button className="cube-front" onClick={() => viewportRef.current?.setView("front")}>FRONT</button>
              <button className="cube-side" onClick={() => viewportRef.current?.setView("right")}>R</button>
            </div>
            <div className="axis-key"><span className="axis-x">X</span><span className="axis-y">Y</span><span className="axis-z">Z</span></div>
            {!atEnd && <div className="rollback-banner"><RefreshCw /> Rolled back to feature {marker}. Future geometry is unavailable. <button onClick={() => setMarker(project.features.length)}>Return to end</button></div>}
          </div>
        </section>

        <aside className="inspector panel">
          <div className="panel-heading">
            <div><span className="eyebrow">PROPERTIES</span><h2>{selectedFeature ? "Feature inspector" : "Inspector"}</h2></div>
            <TinyButton label="Collapse inspector" onClick={() => setRightOpen(false)}><ChevronRight /></TinyButton>
          </div>
          {selectedBody ? (
            <div className="inspector-scroll">
              {selectedFeature && <div className="history-edit-notice"><RefreshCw /> Editing feature #{selectedFeature.sequence}. Changes rebuild downstream history.</div>}
              <section className="property-section object-title">
                <div className={`object-swatch ${selectedBody.role}`}><Box /></div>
                <label><span>Name</span><Input key={selectedBody.name} defaultValue={selectedBody.name} onBlur={(event) => event.target.value !== selectedBody.name && updateSelectedBody({ name: event.target.value }, "Rename", `Rename ${selectedBody.name}`)} /></label>
                <button onClick={() => updateSelectedBody({ visible: !selectedBody.visible }, "Visibility", `${selectedBody.visible ? "Hide" : "Show"} ${selectedBody.name}`)} title="Toggle visibility">{selectedBody.visible ? <Eye /> : <EyeOff />}</button>
                <button onClick={() => updateSelectedBody({ locked: !selectedBody.locked }, "Lock", `${selectedBody.locked ? "Unlock" : "Lock"} ${selectedBody.name}`)} title="Toggle lock">{selectedBody.locked ? <Lock /> : <Unlock />}</button>
              </section>
              <section className="property-section">
                <div className="section-title"><h3>Geometry</h3><span>{selectedBody.shape}</span></div>
                <div className="role-toggle"><button className={selectedBody.role === "solid" ? "active solid" : ""} onClick={() => setRole("solid")}>Solid</button><button className={selectedBody.role === "hole" ? "active hole" : ""} onClick={() => setRole("hole")}>Hole</button></div>
                <div className="axis-field-grid">
                  {selectedBody.size.map((value, axis) => <NumberField key={`size-${axis}-${selectedFeature?.updatedAt}`} label={["W", "D", "H"][axis]} value={value} suffix={project.units} min={0.01} onCommit={(next) => updateVector("size", axis, next)} />)}
                </div>
                {(selectedBody.shape === "Cylinder" || selectedBody.shape === "Cone" || selectedBody.shape === "Polygon prism") && <NumberField label="Sides" value={selectedBody.sides ?? 32} suffix="" min={3} onCommit={(sides) => updateSelectedBody({ sides: Math.round(sides) }, "Change parameters", `Change ${selectedBody.name} sides`)} />}
              </section>
              <section className="property-section">
                <div className="section-title"><h3>Position</h3><button title="Reset position" onClick={() => updateSelectedBody({ position: [0, 0, selectedBody.size[2] / 2] }, "Translate", `Reset ${selectedBody.name} position`)}><RefreshCw /></button></div>
                <div className="axis-field-grid">
                  {selectedBody.position.map((value, axis) => <NumberField key={`pos-${axis}-${selectedFeature?.updatedAt}`} label={["X", "Y", "Z"][axis]} value={value} suffix={project.units} onCommit={(next) => updateVector("position", axis, next)} />)}
                </div>
              </section>
              <section className="property-section">
                <div className="section-title"><h3>Rotation</h3><span>XYZ</span></div>
                <div className="axis-field-grid">
                  {selectedBody.rotation.map((value, axis) => <NumberField key={`rot-${axis}-${selectedFeature?.updatedAt}`} label={["X", "Y", "Z"][axis]} value={value} suffix="°" onCommit={(next) => updateVector("rotation", axis, next)} />)}
                </div>
              </section>
              {mode === "advanced" && selectedFeature && <section className="property-section advanced-data"><div className="section-title"><h3>Dependencies</h3><span>{selectedFeature.status}</span></div><dl><dt>Feature ID</dt><dd>{selectedFeature.id.slice(-12)}</dd><dt>Inputs</dt><dd>{selectedFeature.inputIds.length || "None"}</dd><dt>Outputs</dt><dd>{selectedFeature.outputIds.length || "None"}</dd><dt>Schema</dt><dd>v{selectedFeature.schemaVersion}</dd></dl></section>}
            </div>
          ) : (
            <div className="empty-inspector"><MousePointer2 /><h3>Select something</h3><p>Choose an object in the viewport, outline, or timeline to edit exact dimensions.</p></div>
          )}
          <div className="inspector-footer"><span><span className="status-dot saved" /> Reconstruction</span><b>{reconstructing ? "REBUILDING…" : reconstruction.warnings.length ? `${reconstruction.warnings.length} WARNING` : "UP TO DATE"}</b></div>
        </aside>

        {!rightOpen && <button className="panel-reopen reopen-right" onClick={() => setRightOpen(true)} aria-label="Open inspector"><ChevronLeft /></button>}

        <section className="timeline panel">
          <div className="timeline-topline">
            <button className="outline-toggle" onClick={() => setOutlineOpen((value) => !value)}><ChevronDown className={outlineOpen ? "" : "rotated"} /> OBJECTS <span>{reconstruction.bodies.length}</span></button>
            <div className="timeline-title"><span className="eyebrow">CONSTRUCTION HISTORY</span><strong>Feature timeline</strong></div>
            <div className="playback-controls">
              <TinyButton label="Beginning" onClick={() => setMarker(0)}><SkipBack /></TinyButton>
              <TinyButton label="Step backward" onClick={() => setMarker((value) => Math.max(0, value - 1))}><ChevronLeft /></TinyButton>
              <TinyButton label={playing ? "Pause history" : "Play history"} active={playing} onClick={() => { if (marker >= project.features.length) setMarker(0); setPlaying((value) => !value) }}>{playing ? <Pause /> : <Play />}</TinyButton>
              <TinyButton label="Step forward" onClick={() => setMarker((value) => Math.min(project.features.length, value + 1))}><ChevronRight /></TinyButton>
              <TinyButton label="End" onClick={() => setMarker(project.features.length)}><SkipForward /></TinyButton>
              <Select value={String(playSpeed)} onValueChange={(value) => setPlaySpeed(Number(value))}><SelectTrigger size="sm" className="speed-select"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="0.5">0.5×</SelectItem><SelectItem value="1">1×</SelectItem><SelectItem value="2">2×</SelectItem></SelectContent></Select>
              <button className="checkpoint-button" onClick={createCheckpoint}><Archive /> Checkpoint</button>
              <TinyButton label="Collapse timeline" onClick={() => setTimelineOpen(false)}><ChevronDown /></TinyButton>
            </div>
          </div>
          <div className="timeline-content">
            {outlineOpen && <div className="object-outline">
              <div className="outline-header"><Search /><span>Scene outline</span><MoreHorizontal /></div>
              <div className="outline-list">
                {reconstruction.bodies.map((body) => <button key={body.id} className={selectedIds.includes(body.id) ? "selected" : ""} onClick={(event) => selectBody(body.id, event.shiftKey || event.metaKey || event.ctrlKey)}><span className={`tree-role ${body.role}`}><Box /></span><span>{body.name}</span>{body.locked && <Lock />}{body.visible ? <Eye /> : <EyeOff />}</button>)}
              </div>
            </div>}
            <div className="timeline-track-wrap">
              <div className="timeline-ruler"><span>START</span><span>FEATURE {marker} / {project.features.length}</span><span>END</span></div>
              <div className="timeline-track">
                <button className={`origin-feature ${marker === 0 ? "selected" : ""}`} onClick={() => setMarker(0)}><Home /><span>Origin</span></button>
                {project.features.map((feature, index) => {
                  const future = index >= marker
                  const selected = feature.id === selectedFeatureId
                  const Icon = feature.type.includes("Boolean") ? Group : feature.type.includes("Translate") ? Ruler : feature.type.includes("Rotate") ? RefreshCw : feature.type.includes("Delete") ? Trash2 : Box
                  return <button key={feature.id} className={`feature-tile ${future ? "future" : ""} ${selected ? "selected" : ""} state-${feature.status}`} onClick={() => { setSelectedFeatureId(feature.id); if (feature.outputIds[0]) setSelectedIds([feature.outputIds[0]]) }} onDoubleClick={() => setRightOpen(true)} title={`${feature.name} — ${feature.type}`}><span className="feature-sequence">{String(index + 1).padStart(2, "0")}</span><Icon /><span className="feature-label">{feature.name}</span><span className="feature-state">{feature.suppressed ? "SUPPRESSED" : feature.status === "warning" ? "CHECK" : "OK"}</span>{selected && <button className="feature-more" onClick={(event) => { event.stopPropagation(); suppressFeature(feature.id) }} title="Suppress or unsuppress feature"><MoreHorizontal /></button>}</button>
                })}
                <div className="history-marker" style={{ left: `${project.features.length ? (marker / project.features.length) * 100 : 0}%` }}><span /></div>
              </div>
              <div className="marker-slider"><Slider min={0} max={Math.max(1, project.features.length)} step={1} value={[marker]} onValueChange={(value) => setMarker(Math.min(project.features.length, value[0]))} aria-label="History marker" /></div>
            </div>
          </div>
        </section>
        {!timelineOpen && <button className="timeline-reopen" onClick={() => setTimelineOpen(true)}><ChevronDown /> Open feature timeline</button>}
      </section>

      <input ref={projectInputRef} hidden type="file" accept=".benchcad,.zip" onChange={(event) => { const file = event.target.files?.[0]; if (file) importProjectFile(file); event.currentTarget.value = "" }} />
      <input ref={importInputRef} hidden type="file" accept=".stl,.obj,.svg,.3mf" onChange={(event) => { const file = event.target.files?.[0]; if (file) importGeometry(file); event.currentTarget.value = "" }} />

      <Dialog open={dashboardOpen} onOpenChange={setDashboardOpen}>
        <DialogContent className="dashboard-dialog" showCloseButton={project.features.length > 0}>
          <DialogHeader><div className="dashboard-brand"><span className="brand-mark"><span /><span /><span /></span><div><DialogTitle>BENCHCAD project bench</DialogTitle><DialogDescription>Private, local-first modeling. Your projects never leave this device.</DialogDescription></div></div></DialogHeader>
          <div className="dashboard-actions"><button className="fresh-start" onClick={newProject}><Plus /><span><strong>Fresh Start</strong><small>Create an empty project without deleting existing work</small></span></button><button onClick={() => projectInputRef.current?.click()}><FolderOpen /><span><strong>Open .benchcad</strong><small>Validate and restore a project archive</small></span></button><button onClick={() => importInputRef.current?.click()}><Upload /><span><strong>Import geometry</strong><small>STL, OBJ, SVG, or 3MF</small></span></button></div>
          {localProjects.length > 0 && <section className="dashboard-section"><div className="dashboard-section-title"><h3>Recent local projects</h3><span>{localProjects.length} stored on this device</span></div><div className="recent-grid">{localProjects.slice(0, 3).map((recent) => <button key={recent.id} onClick={() => loadRecent(recent)}><span className="project-preview"><Grid3X3 /><Box /></span><strong>{recent.name}</strong><small>{recent.features.length} features · {reconstruct(recent.features).bodies.length} bodies</small><time>{new Date(recent.updatedAt).toLocaleString()}</time></button>)}</div></section>}
          <section className="dashboard-section"><div className="dashboard-section-title"><h3>Sample projects</h3><span>Learn by rebuilding practical models</span></div><div className="sample-list">{SAMPLE_PROJECTS.map((sample, index) => <button key={sample.name} onClick={() => openSample(sample.project)}><span>{String(index + 1).padStart(2, "0")}</span><div><strong>{sample.name}</strong><small>{sample.description}</small></div><ChevronRight /></button>)}</div></section>
          <div className="dashboard-status"><span><HardDrive /> IndexedDB ready</span><span><WifiOff /> Offline capable</span><span><Check /> No account · no telemetry</span><button onClick={async () => { if (window.confirm("Clear all BENCHCAD projects saved in this browser? Export anything you need first.")) { await clearLocalProjects(); refreshRecents(); toast("Local BENCHCAD storage cleared") } }}><Trash2 /> Clear local data</button></div>
        </DialogContent>
      </Dialog>

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="help-dialog">
          <DialogHeader><DialogTitle>Make a mounting hole</DialogTitle><DialogDescription>A two-minute tour of BENCHCAD’s editable history.</DialogDescription></DialogHeader>
          <ol className="tutorial-steps"><li><b>1</b><span>Place a <strong>Box</strong>, then enter exact dimensions in the Inspector.</span></li><li><b>2</b><span>Add a <strong>Cylinder</strong> and set its role to <em>Hole</em>.</span></li><li><b>3</b><span>Shift-select both bodies and choose <strong>Group / Boolean</strong>.</span></li><li><b>4</b><span>Drag the amber history marker back before the Boolean.</span></li><li><b>5</b><span>Select the cylinder’s create tile and change its diameter.</span></li><li><b>6</b><span>Return to the end. Downstream features rebuild automatically.</span></li></ol>
          <div className="shortcut-grid"><span><kbd>⌘ Z</kbd> Undo command</span><span><kbd>⌘ D</kbd> Duplicate</span><span><kbd>⌥ ← / →</kbd> Step history</span><span><kbd>Space</kbd> Play history</span><span><kbd>/</kbd> Search shapes</span><span><kbd>Esc</kbd> Clear selection</span></div>
          <DialogFooter><Button variant="outline" onClick={exportTimelineReport}><FileDown /> Export timeline report</Button><Button onClick={() => setHelpOpen(false)}>Back to the bench</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(branchShape)} onOpenChange={(open) => !open && setBranchShape(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>You are working in the past</DialogTitle><DialogDescription>Later features are hidden beyond the history marker. Choose where the new {branchShape} should go—future history will never be overwritten silently.</DialogDescription></DialogHeader>
          <div className="branch-choices"><button onClick={() => branchShape && insertShape(branchShape, "end")}><SkipForward /><span><strong>Return to the end</strong><small>Keep all future features and add the shape last.</small></span></button><button onClick={() => branchShape && insertShape(branchShape, "branch")}><Archive /><span><strong>Create a new branch</strong><small>Preserve this point as a separate project version.</small></span></button><button className="danger-choice" onClick={() => branchShape && insertShape(branchShape, "truncate")}><Trash2 /><span><strong>Discard hidden future</strong><small>Remove {project.features.length - marker} later features and continue here.</small></span></button></div>
          <DialogFooter showCloseButton />
        </DialogContent>
      </Dialog>

      <Toaster theme={theme === "light" ? "light" : "dark"} position="bottom-center" richColors />
    </main>
  )
}
