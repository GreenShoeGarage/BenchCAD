import assert from "node:assert/strict"
import test from "node:test"
import {
  canReorderFeature,
  convertUnit,
  emptyProject,
  makeBody,
  makeFeature,
  migrateProject,
  parseProject,
  reconstruct,
  reorderFeature,
  serializeProject,
} from "../lib/benchcad-model.ts"

test("feature serialization preserves stable identifiers", () => {
  const project = emptyProject("Serialization reference")
  const body = makeBody("Box")
  project.features.push(makeFeature("Create primitive", "Create box", 1, body))
  const restored = parseProject(serializeProject(project))
  assert.equal(restored.id, project.id)
  assert.equal(restored.features[0].outputIds[0], body.id)
})

test("timeline rollback and restoration are deterministic", () => {
  const box = makeBody("Box", { name: "Reference box", size: [20, 20, 20] })
  const moved = { ...box, position: [12, 0, 10] as [number, number, number] }
  const features = [makeFeature("Create primitive", "Create box", 1, box), makeFeature("Translate", "Move box", 2, moved, {}, [box.id])]
  assert.deepEqual(reconstruct(features, 0).bodies[0].position, box.position)
  assert.deepEqual(reconstruct(features, 1).bodies[0].position, moved.position)
  assert.deepEqual(reconstruct(features, 0).bodies[0].position, box.position)
})

test("suppression omits a feature without deleting it", () => {
  const body = makeBody("Cylinder")
  const create = makeFeature("Create primitive", "Create cylinder", 1, body)
  create.suppressed = true
  create.status = "suppressed"
  assert.equal(reconstruct([create]).bodies.length, 0)
  assert.equal(create.outputIds[0], body.id)
})

test("dependency-aware reordering blocks unsafe moves", () => {
  const base = makeBody("Box")
  const create = makeFeature("Create primitive", "Create base", 1, base)
  const resize = makeFeature("Resize", "Resize base", 2, { ...base, size: [40, 20, 10] }, {}, [base.id])
  assert.equal(canReorderFeature([create, resize], 0, 1), false)
  assert.deepEqual(reorderFeature([create, resize], 0, 1).map((feature) => feature.id), [create.id, resize.id])
})

test("unit conversion uses millimeters as the internal reference", () => {
  assert.equal(convertUnit(1, "in", "mm"), 25.4)
  assert.equal(convertUnit(1000, "mm", "m"), 1)
})

test("legacy schema migration creates a current recovery-safe project", () => {
  const project = emptyProject("Legacy")
  const legacy = { ...project, schemaVersion: 0, appVersion: undefined }
  const migrated = migrateProject(legacy)
  assert.equal(migrated.schemaVersion, 1)
  assert.equal(migrated.name, "Legacy")
})

test("long feature histories reconstruct without changing body identity", () => {
  const body = makeBody("Box")
  const features = [makeFeature("Create primitive", "Create box", 1, body)]
  for (let index = 1; index < 250; index += 1) {
    features.push(makeFeature("Translate", `Move ${index}`, index + 1, { ...body, position: [index, 0, 10] }, {}, [body.id]))
  }
  const result = reconstruct(features)
  assert.equal(result.completed, 250)
  assert.equal(result.bodies.length, 1)
  assert.equal(result.bodies[0].id, body.id)
  assert.equal(result.bodies[0].position[0], 249)
})
