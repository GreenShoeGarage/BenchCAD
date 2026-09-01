# BENCHCAD v0.36.2 — Shell Interior Edge Visibility

BENCHCAD is a local-first browser CAD workbench combining direct solid modeling, exact numeric control, an editable feature timeline, manufacturing screening, and associative technical drawings.

Version 0.36.2 is a focused viewport-maintenance release. It makes hollow geometry easier to understand by adding topology-derived concave cavity traces and a dedicated **Interior inspect** display style. The authoritative model, feature history, project format, and export geometry are unchanged.

## Release identity

| Item | Value |
|---|---|
| Application | **BENCHCAD 0.36.2** |
| Project schema | **9** |
| Drawing schema | **5** |
| Project migration | None |
| Default viewport style | Shaded + edges |
| New viewport style | Interior inspect |
| Runtime backend | None |
| Telemetry | None |
| Geometry kernel | Packaged Manifold WebAssembly |

## What was fixed

A shelled part could reconstruct correctly while its interior still read as a smooth shaded cavity. The top lip might be visible, but the inner floor loop and vertical corner transitions could disappear into the body color and lighting.

Version 0.36.2 adds a separate shell-cavity line pass. It examines shared edges in the exact reconstructed triangle mesh, identifies concave topology, and places display-only traces slightly toward the cavity air. A dark halo plus pale center line remains visible across both highlights and shadow without turning the entire model into a wireframe.

In the validated 30 × 30 × 20 mm open-top shell, the viewport identified and rendered eight cavity edges.

## Display styles

Open the eye menu in the Model viewport.

### Shaded + edges

The default everyday modeling style now combines:

- Physically based shaded surfaces
- Ordinary silhouette and crease edges
- Topology-derived cavity traces for concave shell corners
- Cyan selection emphasis
- Contact shadows

Use this mode for normal modeling and first-pass shell inspection.

### Shaded

Clean surfaces without feature-edge or cavity overlays. This is useful when linework is unnecessary or when comparing the overlay against the underlying shading.

### Technical

Neutralized surface color with high-contrast engineering linework, including cavity traces when present.

### Interior inspect

A dedicated hollow-part inspection view:

- Ghosts exterior shell faces
- Emphasizes inner surfaces
- Draws dashed through-body cavity traces
- Displays the active cavity-edge count
- Disables ordinary contact shadows to reduce visual clutter

Interior inspect does not alter geometry or create a timeline feature.

### X-ray inspect

Ghosts surfaces and exposes ordinary through-body feature edges. It remains useful for overlaps and obscured geometry; Interior inspect is more specifically tuned to concave hollow-part boundaries.

### Wireframe

Shows tessellated triangle topology. It is not an analytic CAD-edge view.

## Performance safeguards

The linework is intentionally bounded:

- Ordinary feature-edge overlay guard: **180,000 triangles** for unselected bodies
- Shell-cavity overlay guard: **220,000 triangles**
- Maximum cavity-edge display segments: **6,000**

These limits affect optional viewport overlays only. They do not simplify stored geometry, manufacturing checks, technical drawings, or model exports.

## Compatibility

Version 0.36.2 does not change:

- Project schema 9
- Drawing schema 5
- Feature-history semantics
- Shell or Boolean reconstruction
- `.benchcad` archive structure
- Manufacturing analysis
- STL, OBJ, 3MF, SVG, DXF, or PDF output
- Technical Drawings 2.0 reference semantics

Existing projects open without migration.

## Static deployment

Extract the archive contents directly into the target static directory. `index.html` must remain beside `sw.js`, `manifest.webmanifest`, and `assets/`.

```text
index.html
sw.js
manifest.webmanifest
favicon.svg
assets/
  benchcad-v0.36.2.js
  benchcad-v0.36.2.css
  geometry.worker-*.js
  import.worker-*.js
  manifold-*.wasm
```

All runtime paths are relative, so the same package supports a domain root or a nested path such as:

```text
https://example.com/projects/benchcad/
```

A simple local server can be started from the extracted directory:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`. Direct `file:` loading is not supported because Web Workers, WebAssembly, IndexedDB, and the Service Worker are most reliable over HTTPS or localhost.

## Updating an existing deployment

1. Replace the old BENCHCAD application files with the v0.36.2 archive contents.
2. Hard-refresh the page.
3. Clear the previous BENCHCAD site cache/service worker once when the older interface remains visible.
4. Reload while online so the v0.36.2 shell can be cached.

The current service-worker cache name is:

```text
benchcad-v0.36.2-interior-visibility
```

Activation removes older caches whose names begin with `benchcad-`.

## Validation evidence

### Shell-interior workflow

`V0.36.2-INTERIOR-VISIBILITY-TESTS.json` records **30/30 passing checks** using the packaged Three.js application, production geometry worker, and Manifold WebAssembly kernel. It verifies successful shell reconstruction, all six styles, eight cavity traces, distinct frame hashes, visible differences from plain shading, the preference path, and clean page/console output.

The environment blocked navigation to a persistent local or synthetic test origin, so the browser workflow used an in-memory local-storage adapter. Static package checks separately verify that BENCHCAD contains the browser-local preference read/write implementation.

### Drawing regression

`V0.36.2-DRAWING-REGRESSION.json` records **28/28 passing checks** for the retained drawing workflow, including exact source geometry, parent-linked Detail views, layout diagnostics, valid SVG/DXF/PDF downloads, and matching primitive signature `4dd91b27`.

### Package gate

`V0.36.2-PACKAGE-TESTS.json` verifies the release identity, schemas, syntax, WebAssembly magic, required runtime assets, relative nested paths, service-worker precache, documentation, screenshots, current test results, checksum coverage, and ZIP-root structure.

## Known limitations

- Cavity classification is derived from concavity in the tessellated reconstructed mesh, not analytic boundary-representation topology.
- Extremely dense shell meshes may omit the optional cavity overlay because of the documented safeguards.
- Transparent Interior and X-ray modes can show ordinary real-time transparency sorting artifacts.
- Interior inspect is not a measured section, wall-thickness map, ambient-occlusion analysis, or manufacturability result.
- No path tracing, ray tracing, material-authoring environment, or photorealistic renderer is included.

Read `KNOWN-LIMITATIONS.md` before using BENCHCAD output for fabrication.

## Roadmap position

Batch 28 — Technical Drawings 2.0 remains complete. Version 0.36.2 is a focused maintenance release before **Batch 29 — Large-Model Performance**.
