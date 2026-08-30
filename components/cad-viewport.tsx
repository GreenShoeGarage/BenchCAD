"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import type { Body, Feature } from "@/lib/benchcad-model"

export interface ViewportHandle {
  setView: (view: "home" | "front" | "top" | "right") => void
  fitAll: () => void
}

interface Props {
  bodies: Body[]
  booleans: Feature[]
  booleanMeshes: Array<{ targetId: string; consumedIds: string[]; vertices: Float32Array; indices: Uint32Array }>
  selectedIds: string[]
  perspective: boolean
  wireframe: boolean
  showGrid: boolean
  onSelect: (id: string, additive: boolean) => void
  onDropShape: (shape: string) => void
}

function geometryFor(body: Body) {
  const [x, y, z] = body.size
  switch (body.shape) {
    case "Cylinder":
    case "Polygon prism":
      return new THREE.CylinderGeometry(x / 2, y / 2, z, body.shape === "Polygon prism" ? body.sides ?? 6 : body.sides ?? 48)
    case "Sphere":
      return new THREE.SphereGeometry(x / 2, 40, 28)
    case "Cone":
    case "Pyramid":
      return new THREE.ConeGeometry(x / 2, z, body.shape === "Pyramid" ? 4 : body.sides ?? 48)
    case "Torus":
      return new THREE.TorusGeometry(Math.max(1, x * 0.35), Math.max(1, z / 2), 18, 56)
    case "Tube": {
      const shape = new THREE.Shape()
      shape.absarc(0, 0, x / 2, 0, Math.PI * 2, false)
      const hole = new THREE.Path()
      hole.absarc(0, 0, Math.max(1, x * 0.28), 0, Math.PI * 2, true)
      shape.holes.push(hole)
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: z, bevelEnabled: false, curveSegments: 36 })
      geometry.translate(0, 0, -z / 2)
      geometry.rotateX(Math.PI / 2)
      return geometry
    }
    case "Wedge": {
      const geometry = new THREE.BufferGeometry()
      const vertices = new Float32Array([
        -x/2,-z/2,-y/2, x/2,-z/2,-y/2, x/2,-z/2,y/2, -x/2,-z/2,y/2,
        -x/2,z/2,-y/2, -x/2,z/2,y/2,
      ])
      geometry.setAttribute("position", new THREE.BufferAttribute(vertices, 3))
      geometry.setIndex([0,1,2,0,2,3,0,4,1,3,2,5,0,3,5,0,5,4,1,4,5,1,5,2])
      geometry.computeVertexNormals()
      return geometry
    }
    default: {
      const radius = body.shape === "Rounded box" ? Math.min(x, y, z) * 0.08 : 0
      return new THREE.BoxGeometry(x, z, y, radius ? 4 : 1, radius ? 4 : 1, radius ? 4 : 1)
    }
  }
}

export const CadViewport = forwardRef<ViewportHandle, Props>(function CadViewport(
  { bodies, booleans, booleanMeshes, selectedIds, perspective, wireframe, showGrid, onSelect, onDropShape },
  ref,
) {
  const mountRef = useRef<HTMLDivElement>(null)
  const stateRef = useRef<{ camera: THREE.PerspectiveCamera; controls: OrbitControls; renderer: THREE.WebGLRenderer; scene: THREE.Scene } | null>(null)

  useImperativeHandle(ref, () => ({
    setView(view) {
      const state = stateRef.current
      if (!state) return
      const positions = { home: [85, 72, 82], front: [0, 28, 110], top: [0, 120, 0.01], right: [110, 28, 0] } as const
      state.camera.position.set(...positions[view])
      state.controls.target.set(0, 8, 0)
      state.controls.update()
    },
    fitAll() {
      const state = stateRef.current
      if (!state) return
      state.camera.position.set(85, 72, 82)
      state.controls.target.set(0, 8, 0)
      state.controls.update()
    },
  }))

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return
    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#0f1518")
    scene.fog = new THREE.Fog("#0f1518", 170, 340)
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 1000)
    camera.position.set(85, 72, 82)
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    mount.appendChild(renderer.domElement)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.075
    controls.target.set(0, 8, 0)
    controls.update()
    stateRef.current = { camera, controls, renderer, scene }

    scene.add(new THREE.HemisphereLight("#d9ecf1", "#283034", 2.25))
    const key = new THREE.DirectionalLight("#fff0cf", 3.2)
    key.position.set(70, 100, 45)
    key.castShadow = true
    key.shadow.mapSize.set(2048, 2048)
    scene.add(key)
    const grid = new THREE.GridHelper(240, 48, "#537078", "#27383d")
    grid.name = "bench-grid"
    scene.add(grid)
    const axes = new THREE.AxesHelper(22)
    axes.name = "origin-axes"
    axes.position.y = 0.05
    scene.add(axes)
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.ShadowMaterial({ opacity: 0.28 }))
    plane.rotation.x = -Math.PI / 2
    plane.receiveShadow = true
    plane.name = "shadow-plane"
    scene.add(plane)

    const resize = () => {
      const rect = mount.getBoundingClientRect()
      renderer.setSize(rect.width, rect.height, false)
      camera.aspect = rect.width / Math.max(1, rect.height)
      camera.updateProjectionMatrix()
    }
    const observer = new ResizeObserver(resize)
    observer.observe(mount)
    resize()
    let frame = 0
    const render = () => {
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(render)
    }
    render()

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const click = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(scene.children, true)
      const hit = hits.find((item) => item.object.userData.bodyId)
      if (hit) onSelect(hit.object.userData.bodyId, event.shiftKey || event.metaKey || event.ctrlKey)
    }
    renderer.domElement.addEventListener("pointerdown", click)
    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
      renderer.domElement.removeEventListener("pointerdown", click)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
      stateRef.current = null
    }
  }, [onSelect])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    const previous = state.scene.getObjectByName("bodies")
    if (previous) state.scene.remove(previous)
    const group = new THREE.Group()
    group.name = "bodies"
    const consumedHoles = new Set(booleanMeshes.flatMap((mesh) => mesh.consumedIds))
    const meshByTarget = new Map(booleanMeshes.map((mesh) => [mesh.targetId, mesh]))
    for (const body of bodies) {
      if (!body.visible || consumedHoles.has(body.id)) continue
      const calculated = meshByTarget.get(body.id)
      const geometry = calculated ? new THREE.BufferGeometry() : geometryFor(body)
      if (calculated) {
        const threeVertices = new Float32Array(calculated.vertices.length)
        for (let index = 0; index < calculated.vertices.length; index += 3) {
          threeVertices[index] = calculated.vertices[index]
          threeVertices[index + 1] = calculated.vertices[index + 2]
          threeVertices[index + 2] = calculated.vertices[index + 1]
        }
        geometry.setAttribute("position", new THREE.BufferAttribute(threeVertices, 3))
        geometry.setIndex(new THREE.BufferAttribute(calculated.indices, 1))
        geometry.computeVertexNormals()
      }
      const selected = selectedIds.includes(body.id)
      const material = new THREE.MeshStandardMaterial({
        color: body.role === "hole" ? "#6bd7e5" : body.color,
        roughness: 0.58,
        metalness: 0.08,
        transparent: body.role === "hole",
        opacity: body.role === "hole" ? 0.34 : 1,
        wireframe: wireframe || body.role === "hole",
      })
      const mesh = new THREE.Mesh(geometry, material)
      mesh.userData.bodyId = body.id
      if (!calculated) {
        mesh.position.set(body.position[0], body.position[2], body.position[1])
        mesh.rotation.set(THREE.MathUtils.degToRad(body.rotation[0]), THREE.MathUtils.degToRad(body.rotation[2]), THREE.MathUtils.degToRad(body.rotation[1]))
      }
      mesh.castShadow = body.role === "solid"
      mesh.receiveShadow = true
      group.add(mesh)
      if (selected) {
        const edge = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: "#80efff" }))
        edge.position.copy(mesh.position)
        edge.rotation.copy(mesh.rotation)
        edge.userData.bodyId = body.id
        group.add(edge)
      }
    }
    state.scene.add(group)
  }, [bodies, booleans, booleanMeshes, selectedIds, wireframe])

  useEffect(() => {
    const state = stateRef.current
    if (!state) return
    state.scene.getObjectByName("bench-grid")!.visible = showGrid
    state.camera.fov = perspective ? 42 : 9
    state.camera.updateProjectionMatrix()
  }, [perspective, showGrid])

  return (
    <div
      ref={mountRef}
      className="cad-viewport"
      aria-label="Interactive three-dimensional model viewport"
      onDragOver={(event) => event.preventDefault()}
      onDrop={(event) => {
        event.preventDefault()
        const shape = event.dataTransfer.getData("application/x-benchcad-shape")
        if (shape) onDropShape(shape)
      }}
    />
  )
})
