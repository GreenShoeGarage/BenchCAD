# BENCHCAD v0.36.2 Known Limitations

BENCHCAD v0.36.2 retains the completed Technical Drawings 2.0 roadmap, but it remains a lightweight mesh-based CAD system rather than a full analytic mechanical drafting package. Review every drawing before fabrication.

## Geometry and topology

BENCHCAD reconstructs manifold triangle meshes. It does not yet maintain analytic boundary-representation faces, edges, cylinders, arcs, and persistent topological names comparable to a professional mechanical CAD kernel.

Consequences include:

- Large upstream topology changes can invalidate projected edge or vertex references.
- A unique compatible repair can be proposed, but it always requires review.
- Ambiguous references remain unresolved and block output.
- Tangent classification is derived from tessellated faces.
- Imported mesh features do not automatically acquire design intent.

## Circle, hole, and thread semantics

Closed projected mesh loops are offered as circles only when conservative geometric checks pass. Partial arcs are not exposed as standalone radial entities.

Hole and thread callouts are richest when the model contains BENCHCAD hole or thread metadata. A generic circular loop in an imported mesh is not automatically identified as drilled, counterbored, countersunk, tapped, or threaded.

## Detail views

Detail views are true parent-linked crops, but the current envelope is intentionally bounded:

- Crop regions are circular or rectangular.
- Crops are defined in projected model space.
- The child view retains its parent's orientation and exact source-body set.
- Freeform, spline, broken-out, offset, chained, and multi-region Detail crops are not implemented.
- Detail callout leaders use an automatic placement rather than a fully editable leader path.
- Automatic label sequencing and duplicate-label arbitration are not yet comprehensive.
- A Detail view cannot independently suppress individual parent source bodies.

## Sections

BENCHCAD supports axis-aligned full sections using global X, Y, or Z cutting planes.

Not implemented:

- Offset sections.
- Aligned sections.
- Broken-out sections.
- Revolved or removed sections.
- Half sections.
- User-defined arbitrary cutting-plane orientation.
- Standards-specific material hatch libraries.

Open or ambiguous section loops remain blocking rather than being repaired silently.

## Dimensions and annotations

Implemented dimensions cover overall, horizontal, vertical, aligned, angular, ordinate, diameter, and radius use cases, along with center marks, centerlines, hole callouts, and thread callouts.

Not yet implemented:

- Baseline and chain dimension managers.
- Datum features and datum targets.
- Geometric dimensioning and tolerancing feature-control frames.
- Surface-finish symbols.
- Welding symbols.
- Dual-unit and alternate-unit display.
- Limits-and-fits databases.
- Inspection balloons and bill-of-material callouts.
- Automatic dimension placement or comprehensive dimension collision avoidance.

## Layout diagnostics

Printable-area and collision diagnostics are advisory, not a complete automatic sheet-layout solver.

- BENCHCAD reports view, title-block, note, and annotation overlaps.
- It does not silently move content.
- It does not guarantee that all leader crossings or dense linework conflicts are detected.
- Deliberate overlaps remain exportable after review.
- Layout warnings are not manufacturing approval.

## Output formats

SVG, DXF, and PDF are produced from the same resolved drawing primitive stream, and a deterministic signature is embedded for parity checking.

Limitations:

- The signature is not cryptographic and does not establish authorship or approval.
- DXF output is a focused two-dimensional exchange representation, not a complete implementation of every DXF entity or drafting standard.
- PDF output is vector-oriented but not tagged for screen-reader navigation.
- Downstream applications may apply their own font, line-weight, unit, or import behavior.
- External application round-trip editing is not guaranteed.

## Drawing standards

BENCHCAD provides first-angle and third-angle projection placement and common drawing conventions, but it does not claim automatic compliance with every ASME, ISO, DIN, JIS, or company drafting standard. Title blocks, line weights, annotation practices, tolerances, and release controls must be reviewed against the governing standard for the work.

## Performance

Dense meshes, many views, hidden-line depth tests, section reconstruction, and reference-rich annotations can be computationally expensive. Batch 29 will focus on incremental reconstruction, caching, worker scheduling, level of detail, cancellation, and memory diagnostics.

## Viewport rendering and inspection

BENCHCAD v0.36.2 improves hollow-part legibility, but the viewport remains an engineering work view rather than a photorealistic or analytic topology renderer.

- There is no path tracing, ray tracing, screen-space ambient occlusion, environment-map library, or texture/material authoring system in this release.
- Ordinary **Shaded + edges** linework comes from the displayed triangle mesh. Tessellation, smoothing, and edge-angle thresholds can affect which ordinary crease lines appear.
- Shell-cavity traces are classified from local concavity at shared edges in the tessellated reconstructed mesh. They are not persistent analytic boundary-representation edge identities.
- Cavity tracing is intentionally conservative. Some rounded, blended, noisy, non-manifold, imported, or unusual concave topology may not produce the line a user expects.
- Cavity overlays stop at 6,000 segments and are skipped above 220,000 triangles. Ordinary feature-edge overlays remain guarded above 180,000 triangles for dense unselected bodies.
- **Interior inspect** ghosts exterior faces, emphasizes inner surfaces, and adds through-body cavity traces. It is not a true clipped section, wall-thickness analysis, screen-space ambient occlusion calculation, or manufacturing result.
- **X-ray inspect** exposes ordinary through-body feature edges rather than specifically classifying all interior design intent.
- **Wireframe** displays mesh topology rather than analytic design edges.
- Transparent Interior and X-ray bodies can show depth-sorting artifacts inherent to real-time transparency.
- Color and contrast depend on the monitor, browser color pipeline, theme, and body color. Technical mode is provided when neutral material contrast is more useful than authored color.
## Interface and responsive behavior

The v0.36.2 viewport and UI cleanup gives the canvas priority, but it does not remove the inherent density of a CAD tool.

- At constrained widths, modeling and drawing command groups scroll horizontally inside their own toolbar rather than shrinking or overlapping.
- Tablet and mobile layouts expose Shapes, Inspect, and History as drawers; not every panel is visible simultaneously.
- Panel, outline, theme, and workspace-mode preferences are stored in browser-local storage and can be removed by site-data cleanup.
- Canvas Focus is intentionally session-only so a later visit does not appear to be missing panels.
- Touch viewing and light editing are supported, but precision topology selection and dense drafting remain best with a mouse, trackpad, or stylus.
- The v0.36.2 renderer uses `PCFShadowMap`; the earlier inherited `PCFSoftShadowMap` warning is no longer expected.

## Browser qualification

The v0.36.2 production workflow was exercised in Chromium with real Three.js and Manifold WebAssembly. Firefox and Safari/WebKit runtimes were not available in the release container and were not falsely reported as tested. Real-device Gecko and WebKit qualification remains part of Batch 30 public-beta hardening.

## Local storage and offline use

Browser storage can be removed by site-data clearing, private browsing, storage pressure, browser cleanup, or operating-system cleanup. Export `.benchcad` files for durable backups.

The service worker requires HTTPS or localhost in normal browser security models. A first successful network load is required before the complete shell is available offline.

## STEP and analytic interchange

STEP export remains deferred. BENCHCAD does not wrap triangle meshes in a STEP-like file and claim analytic solid interoperability. Reliable STEP output requires a trustworthy boundary-representation solid model and persistent topology naming.

## Fabrication responsibility

Manufacturing readiness checks and drawing diagnostics are screening tools. They do not replace engineering review, tolerance analysis, material/process verification, machine setup, code compliance, or inspection planning.
