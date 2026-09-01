# BENCHCAD v0.36.1 — Viewport Clarity and Shell Inspection

BENCHCAD is a local-first browser Computer-Aided Design workbench built around approachable solid modeling, exact numeric input, an editable feature timeline, local project persistence, manufacturing screening, and associative technical drawings.

Version 0.36.1 is a focused maintenance release for the three-dimensional viewport. Its purpose is simple: make model form easier to read, especially in shelled boxes, pockets, bores, recesses, and other parts where an uninterrupted body color can hide internal boundaries.

The packaged application runs from ordinary static hosting. It requires no account, backend, cloud database, telemetry, Node.js runtime, or build step.

## Release identity

| Item | Value |
|---|---|
| Application | **BENCHCAD 0.36.1** |
| Project schema | **9** |
| Drawing schema | **5** |
| Release type | Focused rendering and inspection maintenance release |
| Project migration | None |
| Runtime backend | None |
| Telemetry | None |
| Default display | Shaded + edges |
| Included geometry kernel | Manifold WebAssembly |

## Why this release exists

The previous shaded viewport could correctly reconstruct a shelled part while still communicating it poorly. A nearly uniform orange material, limited surface separation, and weak internal-edge contrast made the cavity and wall intersections difficult to interpret.

Version 0.36.1 separates **model correctness** from **display clarity**. It leaves the authoritative geometry and feature history unchanged while adding viewport styles that reveal different aspects of the same reconstructed mesh.

## Display-style menu

Open the eye menu in the viewport toolbar.

### Shaded + edges

This is the new default and the recommended everyday view.

- Physically based shaded surfaces communicate face direction.
- Geometry-derived edges emphasize silhouettes, shell lips, bores, pockets, and internal wall intersections.
- Selected bodies receive a separate cyan outline.
- Contact shadows remain enabled for grounded depth cues.

### Shaded

Use Shaded when the model is simple or edge overlays are visually unnecessary.

- Displays clean shaded surfaces.
- Preserves body color and opacity.
- Avoids feature-edge overlays while retaining selection feedback.

### Technical

Use Technical when body color or surface highlights obscure the shape.

- Blends body colors toward a neutral engineering-workbench material.
- Uses high-contrast feature edges.
- Retains the same geometry, camera, and project state.

### X-ray inspect

Use X-ray inspect to understand obscured cavities and overlapping geometry.

- Ghosts solid surfaces.
- Shows visible feature edges.
- Adds subdued through-body feature edges without depth testing.
- Disables the ordinary contact-shadow plane to reduce visual confusion.

X-ray inspect is a display aid. It does not calculate wall thickness, create a clipped section, or replace a fabrication drawing.

### Wireframe

Use Wireframe to inspect tessellation and mesh density.

- Displays triangle-mesh topology.
- Uses double-sided transparent mesh lines.
- Does not claim to show analytic boundary-representation edges.

## Rendering implementation

The v0.36.1 viewport uses:

- `MeshPhysicalMaterial` for shaded body presentation.
- ACES filmic tone mapping.
- sRGB output color space.
- Hemisphere, ambient, key, fill, and rim lighting.
- Geometry-derived `EdgesGeometry` overlays.
- A separate expanded cyan selection outline.
- Explicit X-ray hidden-edge overlays.
- `PCFShadowMap` for real-time shadows.

Body colors remain project data. The display style is a browser-local interface preference and is never serialized as model geometry.

## Dense-model protection

Extracting feature edges from every very dense body can stall an otherwise usable project. BENCHCAD therefore caps ordinary edge extraction for **unselected bodies above 180,000 triangles**.

This safeguard changes only the optional viewport overlay. It does not simplify or replace:

- The authoritative body mesh
- Feature reconstruction
- Model export
- Manufacturing checks
- Technical-drawing projection
- Saved project data

Selected-body emphasis remains available so the user can still identify the active object.

## Inspecting a shelled part

A practical inspection sequence is:

1. Create or open the shelled body.
2. Choose **Shaded + edges** and orbit the opening into view.
3. Confirm that the opening perimeter, shell lip, inner corners, and wall intersections are readable.
4. Switch to **Technical** when authored color hides subtle form.
5. Switch to **X-ray inspect** to reveal obscured edges and compare inner and outer boundaries.
6. Use the Drawing workspace or an explicit modeling section when measured section geometry is required.

The viewport style can be changed at any time without adding a timeline feature or dirtying the project.

## What did not change

Version 0.36.1 does not change:

- Project schema 9
- Drawing schema 5
- Feature-history semantics
- Boolean or shell reconstruction
- Body dimensions, position, rotation, scale, color, or opacity
- `.benchcad` archive structure
- Manufacturing preflight
- STL, OBJ, 3MF, SVG, DXF, or PDF geometry
- Technical Drawings 2.0 reference semantics

Existing projects therefore require no migration.

## Static deployment

The archive has no required enclosing folder. Copy its contents directly into the intended static web directory.

Required runtime structure:

```text
index.html
sw.js
manifest.webmanifest
favicon.svg
assets/
  benchcad-v0.36.1.js
  benchcad-v0.36.1.css
  geometry.worker-*.js
  import.worker-*.js
  manifold-*.wasm
```

All runtime paths are relative. BENCHCAD can be hosted at a root URL or a nested path such as:

```text
https://example.com/projects/benchcad/
```

Local test server:

```bash
cd path/to/extracted/benchcad
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

Direct `file:` loading is not the supported path because service workers, workers, WebAssembly, and browser storage are most reliable over HTTPS or localhost.

## Updating an existing deployment

1. Back up any server-side custom files stored in the BENCHCAD directory.
2. Replace the old application files with the v0.36.1 archive contents.
3. Hard-refresh the page.
4. When v0.36.0 remains visible, clear the old BENCHCAD site cache/service worker once.
5. Reload once while online so the new application shell can be cached.

The v0.36.1 service worker uses the cache namespace:

```text
benchcad-v0.36.1-viewport-clarity
```

During activation it removes earlier cache entries whose names begin with `benchcad-`.

## Validation evidence

### Focused production-browser test

`VIEWPORT-RENDERING-TESTS.json` records **30/30 passing checks**. The test used the packaged application with its actual Three.js renderer, geometry worker, and Manifold WebAssembly kernel.

It verified:

- Application and version rendering
- Creation of the real geometry worker
- Fresh-project operation
- Box creation
- Shell command availability and successful shell reconstruction
- Default Shaded + edges presentation
- Shaded, Technical, X-ray, Wireframe, and Shaded + edges control states
- Five distinct rendered frame hashes
- No document-level horizontal overflow at 1200, 1024, 820, and 390 pixels
- Display-menu accessibility at each tested width
- No page errors, console errors, or console warnings
- Removal of the inherited deprecated soft-shadow warning

### Package gate

`V0.36.1-PACKAGE-TESTS.json` verifies the final application identity, schema values, relative runtime paths, service-worker shell, syntax, required assets, documentation images, test result, and absence of stale v0.36.0 runtime bundle references.

### Retained regressions

The complete package also retains the v0.36.0 UI, worker, drawing, and static-hosting reports so the focused rendering release does not erase the evidence for previously completed behavior.

## Known limitations

The viewport is optimized for engineering legibility, not photorealistic presentation.

Not included in v0.36.1:

- Ray tracing or path tracing
- Screen-space ambient occlusion
- Texture or material authoring
- Environment-map libraries
- Wall-thickness heat maps
- Arbitrary interactive section planes
- Photorealistic image export

Feature edges come from the tessellated mesh and an angle threshold. X-ray transparency can show normal real-time depth-sorting artifacts when many transparent surfaces overlap. Wireframe represents mesh triangles, not analytic CAD topology.

Read `KNOWN-LIMITATIONS.md` before relying on BENCHCAD output for fabrication.

## Package contents

The complete archive includes:

- The static application shell
- JavaScript and CSS bundles
- Geometry and import workers
- Manifold WebAssembly
- Web manifest and icons
- GitHub `README.md`
- This release guide
- Release notes and known limitations
- Shaded-edge and X-ray screenshots
- Machine-readable and human-readable validation reports
- Per-file SHA-256 checksums

## Roadmap position

Batch 28 — Technical Drawings 2.0 remains complete. Version 0.36.1 is a maintenance release between Batch 28 and Batch 29.

The next roadmap stage is **Batch 29 — Large-Model Performance**, covering incremental reconstruction, cache policy, selective work, level of detail, cancellation, worker scheduling, and memory diagnostics.
