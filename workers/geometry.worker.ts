import ManifoldModule from "manifold-3d"

type WorkerBody = {
  id: string
  shape: string
  position: [number, number, number]
  rotation: [number, number, number]
  size: [number, number, number]
  sides?: number
}

type WorkerFeature = {
  id: string
  type: string
  inputIds: string[]
  parameters: Record<string, unknown>
}

let modulePromise: ReturnType<typeof ManifoldModule> | null = null

async function manifoldModule() {
  modulePromise ??= ManifoldModule()
  const manifold = await modulePromise
  manifold.setup()
  return manifold
}

function primitive(manifold: Awaited<ReturnType<typeof ManifoldModule>>, body: WorkerBody) {
  const [x, y, z] = body.size
  let solid
  switch (body.shape) {
    case "Cylinder":
    case "Polygon prism":
      solid = manifold.Manifold.cylinder(z, x / 2, y / 2, body.shape === "Polygon prism" ? body.sides ?? 6 : body.sides ?? 48, true)
      break
    case "Sphere":
      solid = manifold.Manifold.sphere(x / 2, 48)
      break
    case "Cone":
    case "Pyramid":
      solid = manifold.Manifold.cylinder(z, x / 2, 0, body.shape === "Pyramid" ? 4 : body.sides ?? 48, true)
      break
    default:
      solid = manifold.Manifold.cube([x, y, z], true)
  }
  return solid.rotate(body.rotation).translate(body.position)
}

self.onmessage = async (event: MessageEvent<{ type: "reconstruct"; bodies: WorkerBody[]; booleans: WorkerFeature[] }>) => {
  if (event.data.type !== "reconstruct") return
  try {
    const manifold = await manifoldModule()
    const bodyMap = new Map(event.data.bodies.map((body) => [body.id, body]))
    const results = []
    for (const feature of event.data.booleans) {
      const inputs = feature.inputIds.map((id) => bodyMap.get(id)).filter(Boolean) as WorkerBody[]
      if (inputs.length < 2) throw new Error(`${feature.id}: Boolean feature needs at least two valid inputs`)
      let result = primitive(manifold, inputs[0])
      for (const input of inputs.slice(1)) {
        const tool = primitive(manifold, input)
        result = feature.type.toLowerCase().includes("subtract") ? result.subtract(tool) : result.add(tool)
        tool.delete()
      }
      const mesh = result.getMesh()
      const vertices = new Float32Array(mesh.numVert * 3)
      for (let index = 0; index < mesh.numVert; index += 1) {
        const source = mesh.position(index)
        vertices[index * 3] = source[0]
        vertices[index * 3 + 1] = source[1]
        vertices[index * 3 + 2] = source[2]
      }
      const indices = new Uint32Array(mesh.triVerts)
      results.push({ featureId: feature.id, targetId: inputs[0].id, consumedIds: inputs.slice(1).map((body) => body.id), vertices, indices })
      result.delete()
    }
    self.postMessage({ type: "complete", results }, results.flatMap((result) => [result.vertices.buffer, result.indices.buffer]))
  } catch (error) {
    self.postMessage({ type: "error", message: error instanceof Error ? error.message : "Geometry reconstruction failed" })
  }
}
