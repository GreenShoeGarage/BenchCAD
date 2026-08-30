export type Vec3 = [number, number, number]

export type ShapeType =
  | "Box"
  | "Cylinder"
  | "Sphere"
  | "Cone"
  | "Torus"
  | "Wedge"
  | "Pyramid"
  | "Tube"
  | "Rounded box"
  | "Polygon prism"
  | "Text"

export type BodyRole = "solid" | "hole"
export type FeatureStatus = "valid" | "warning" | "failed" | "suppressed"

export interface Body {
  id: string
  name: string
  shape: ShapeType
  role: BodyRole
  position: Vec3
  rotation: Vec3
  size: Vec3
  color: string
  visible: boolean
  locked: boolean
  sides?: number
  text?: string
}

export interface Feature {
  id: string
  type: string
  name: string
  sequence: number
  inputIds: string[]
  outputIds: string[]
  parameters: Record<string, unknown>
  snapshot?: Body
  suppressed: boolean
  status: FeatureStatus
  createdAt: string
  updatedAt: string
  schemaVersion: 1
}

export interface Checkpoint {
  id: string
  name: string
  featureIndex: number
  createdAt: string
}

export interface BenchProject {
  id: string
  name: string
  units: "mm" | "cm" | "in" | "m"
  features: Feature[]
  checkpoints: Checkpoint[]
  createdAt: string
  updatedAt: string
  schemaVersion: 1
  appVersion: string
}

export const APP_VERSION = "0.1.0"

export const uid = (prefix: string) =>
  `${prefix}-${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}`

export function makeBody(shape: ShapeType, overrides: Partial<Body> = {}): Body {
  const defaults: Record<ShapeType, Vec3> = {
    Box: [30, 30, 20],
    Cylinder: [20, 20, 25],
    Sphere: [24, 24, 24],
    Cone: [24, 24, 28],
    Torus: [30, 30, 10],
    Wedge: [30, 30, 20],
    Pyramid: [30, 30, 28],
    Tube: [26, 26, 24],
    "Rounded box": [32, 26, 16],
    "Polygon prism": [26, 26, 24],
    Text: [36, 10, 4],
  }
  return {
    id: uid("body"),
    name: shape,
    shape,
    role: "solid",
    position: [0, 0, defaults[shape][2] / 2],
    rotation: [0, 0, 0],
    size: defaults[shape],
    color: "#e59b42",
    visible: true,
    locked: false,
    sides: shape === "Polygon prism" ? 6 : 32,
    text: shape === "Text" ? "BENCH" : undefined,
    ...overrides,
  }
}

export function makeFeature(
  type: string,
  name: string,
  sequence: number,
  snapshot?: Body,
  parameters: Record<string, unknown> = {},
  inputIds: string[] = [],
): Feature {
  const now = new Date().toISOString()
  return {
    id: uid("feature"),
    type,
    name,
    sequence,
    inputIds,
    outputIds: snapshot ? [snapshot.id] : inputIds.slice(0, 1),
    parameters,
    snapshot: snapshot ? structuredClone(snapshot) : undefined,
    suppressed: false,
    status: "valid",
    createdAt: now,
    updatedAt: now,
    schemaVersion: 1,
  }
}

export function emptyProject(name = "Untitled fixture"): BenchProject {
  const now = new Date().toISOString()
  return {
    id: uid("project"),
    name,
    units: "mm",
    features: [],
    checkpoints: [],
    createdAt: now,
    updatedAt: now,
    schemaVersion: 1,
    appVersion: APP_VERSION,
  }
}

export interface Reconstruction {
  bodies: Body[]
  booleans: Feature[]
  warnings: string[]
  completed: number
}

export function reconstruct(features: Feature[], marker = features.length - 1): Reconstruction {
  const bodies = new Map<string, Body>()
  const booleans: Feature[] = []
  const warnings: string[] = []
  const capped = Math.min(marker, features.length - 1)
  for (let index = 0; index <= capped; index += 1) {
    const feature = features[index]
    if (feature.suppressed) continue
    if (feature.status === "failed") {
      warnings.push(`${feature.name} failed; the last valid geometry is preserved.`)
      continue
    }
    if (feature.snapshot) bodies.set(feature.snapshot.id, structuredClone(feature.snapshot))
    if (feature.type.startsWith("Boolean")) {
      const missing = feature.inputIds.filter((id) => !bodies.has(id))
      if (missing.length) warnings.push(`${feature.name} is unresolved because ${missing.length} input is unavailable.`)
      else booleans.push(feature)
    }
    if (feature.type === "Delete") feature.inputIds.forEach((id) => bodies.delete(id))
  }
  return { bodies: [...bodies.values()], booleans, warnings, completed: Math.max(0, capped + 1) }
}

export function latestBody(features: Feature[], bodyId: string): Body | undefined {
  return reconstruct(features).bodies.find((body) => body.id === bodyId)
}

export function convertUnit(value: number, from: BenchProject["units"], to: BenchProject["units"]) {
  const millimeters: Record<BenchProject["units"], number> = { mm: 1, cm: 10, in: 25.4, m: 1000 }
  return (value * millimeters[from]) / millimeters[to]
}

export function validateProject(value: unknown): value is BenchProject {
  if (!value || typeof value !== "object") return false
  const project = value as Partial<BenchProject>
  return project.schemaVersion === 1 && typeof project.name === "string" && Array.isArray(project.features)
}

export function serializeProject(project: BenchProject) {
  return JSON.stringify(project)
}

export function parseProject(serialized: string): BenchProject {
  const value = JSON.parse(serialized) as unknown
  if (!validateProject(value)) throw new Error("Unsupported or corrupt BENCHCAD project")
  return value
}

export function migrateProject(value: unknown): BenchProject {
  if (validateProject(value)) return structuredClone(value)
  if (value && typeof value === "object") {
    const legacy = value as Partial<BenchProject> & { schemaVersion?: number }
    if ((legacy.schemaVersion === 0 || legacy.schemaVersion === undefined) && typeof legacy.name === "string" && Array.isArray(legacy.features)) {
      return {
        ...emptyProject(legacy.name),
        ...legacy,
        features: legacy.features.map((feature, index) => ({ ...feature, sequence: index + 1, schemaVersion: 1 })),
        checkpoints: legacy.checkpoints ?? [],
        schemaVersion: 1,
        appVersion: APP_VERSION,
      } as BenchProject
    }
  }
  throw new Error("No safe migration path exists for this project")
}

export function canReorderFeature(features: Feature[], from: number, to: number) {
  if (from < 0 || to < 0 || from >= features.length || to >= features.length) return false
  const moving = features[from]
  const produced = new Set(moving.outputIds)
  const required = new Set(moving.inputIds)
  if (to > from) {
    return !features.slice(from + 1, to + 1).some((feature) => feature.inputIds.some((id) => produced.has(id)))
  }
  return !features.slice(to, from).some((feature) => feature.outputIds.some((id) => required.has(id)))
}

export function reorderFeature(features: Feature[], from: number, to: number) {
  if (!canReorderFeature(features, from, to)) return features
  const next = features.slice()
  const [moving] = next.splice(from, 1)
  next.splice(to, 0, moving)
  return next.map((feature, index) => ({ ...feature, sequence: index + 1 }))
}

function projectFromBodies(name: string, bodies: Body[], booleanInputs?: string[]): BenchProject {
  const project = emptyProject(name)
  project.features = bodies.map((body, index) => makeFeature("Create primitive", `Create ${body.name}`, index + 1, body))
  if (booleanInputs?.length) {
    project.features.push(
      makeFeature(
        "Boolean subtract",
        "Subtract mounting holes",
        project.features.length + 1,
        undefined,
        { operation: "subtract" },
        booleanInputs,
      ),
    )
  }
  return project
}

export const SAMPLE_PROJECTS: Array<{ name: string; description: string; project: BenchProject }> = (() => {
  const plate = makeBody("Rounded box", { name: "Mounting plate", size: [72, 42, 6], position: [0, 0, 3], color: "#d79645" })
  const holeA = makeBody("Cylinder", { name: "Left hole", role: "hole", size: [8, 8, 10], position: [-25, 0, 5] })
  const holeB = makeBody("Cylinder", { name: "Right hole", role: "hole", size: [8, 8, 10], position: [25, 0, 5] })
  const bracket = projectFromBodies("Mounting plate", [plate, holeA, holeB], [plate.id, holeA.id, holeB.id])

  const base = makeBody("Box", { name: "Nameplate base", size: [88, 34, 5], position: [0, 0, 2.5], color: "#698e9e" })
  const text = makeBody("Text", { name: "Raised BENCH text", size: [58, 12, 3], position: [0, 0, 6.5], color: "#e9ad55", text: "BENCH" })
  const nameplate = projectFromBodies("Workshop nameplate", [base, text])

  const block = makeBody("Box", { name: "Parametric block", size: [56, 34, 18], position: [0, 0, 9], color: "#668b92" })
  const cut = makeBody("Cylinder", { name: "Editable cut", role: "hole", size: [16, 16, 24], position: [0, 0, 12] })
  const parametric = projectFromBodies("Editable dimension demo", [block, cut], [block.id, cut.id])
  parametric.checkpoints.push({ id: uid("checkpoint"), name: "Before hole", featureIndex: 0, createdAt: new Date().toISOString() })

  return [
    { name: "Mounting plate", description: "Two editable mounting holes and a clean subtract feature.", project: bracket },
    { name: "Workshop nameplate", description: "Raised text on a printable base.", project: nameplate },
    { name: "Rebuild demonstration", description: "Change an earlier hole diameter and replay the history.", project: parametric },
  ]
})()
