# BENCHCAD v0.37.0 Known Limitations

BENCHCAD v0.37.0 adds persistent face/workplane sketches and bidirectional extrusion while retaining the completed Technical Drawings 2.0 roadmap. It remains a lightweight mesh-based CAD system rather than a full analytic mechanical CAD and drafting package. Review every model and drawing before fabrication.

## Sketching and face associativity

- Sketches are planar; three-dimensional sketches, surface wrapping, embossing, and projected-on-surface curves are not implemented.
- The current geometric/constraint tools are useful for practical profiles but are not a complete professional parametric sketch solver.
- A new sketch starts in Select. Connected line and Closed polyline begin only when chosen. `Escape` cancels transient geometry and resets the command; `Enter` commits an open line chain.
- Face-supported sketches store a support-body reference and a reconstructed planar face frame. They do not use persistent analytic boundary-representation face names.
- Major upstream topology changes can make a support face unresolved. BENCHCAD reports the unresolved support rather than silently attaching the sketch to a different face.
- Exact body/face underlay depends on an exact reconstructed mesh. When that mesh is unavailable, the editor can show a clearly labeled approximate envelope only as an orientation aid.
- Very dense support geometry can be simplified or bounded for interactive underlay performance. The underlay is not the authoritative model; reconstruction remains authoritative.
- A persistent three-dimensional sketch overlay is a visibility and selection aid. It is not exported as solid geometry unless a downstream modeling feature consumes it.
- Straight profile extrusion supports Positive, Negative, and Symmetric directions. Draft/taper and variable-direction extrusion are not part of this workflow.
- Join and Cut require a resolvable target body. A face-supported sketch defaults to its support body only when that relationship remains valid.
- Editing an upstream sketch can invalidate downstream profile selection or Boolean results; failures remain visible in the feature history.

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

BENCHCAD v0.37.0 retains the all-angle modeling readability work from v0.36.4, but the viewport remains an engineering work view rather than a photorealistic or calibrated renderer.

- Display styles, lighting presets, and dark-face lift are independent browser-local preferences. They do not change authoritative geometry or exported files.
- The camera-relative headlight and fixed underside fill are deliberate CAD visibility aids. They do not represent real lamps, measured exposure, material reflectance, or a physical environment.
- **Natural**, **Balanced**, and **Bright** change camera/underside assistance, ambient contribution, and a small material-color floor. Bright can flatten curvature and directional shading; Natural retains more falloff.
- **Workbench** is intentionally matte and neutral. Its reduced contact shadow is an orientation cue, not a physically calibrated light simulation.
- **Flat / CAD** and **Performance** use diffuse Lambert materials and disable cast shadows. Fine curvature can look flatter by design.
- **Technical** suppresses authored color drama to prioritize linework and topology.
- **Presentation** adds warmer highlights and stronger face contrast, but does not provide ray-traced reflections, clearcoat simulation, studio environments, or photorealistic output.
- **Performance** caps renderer pixel ratio at 1.25. High-DPR displays may show slightly softer edges in exchange for lower pixel load.
- There is no path tracing, ray tracing, screen-space ambient occlusion, environment-map library, texture/material authoring system, or measured photometric model.
- Ordinary Shaded + edges linework comes from the displayed triangle mesh. Tessellation, smoothing, and edge-angle thresholds can affect which crease lines appear.
- Shell-cavity traces are classified from local concavity at shared edges in the tessellated reconstructed mesh. They are not persistent analytic boundary-representation identities.
- Cavity tracing is conservative and bounded at 6,000 segments; cavity extraction is skipped above 220,000 triangles and ordinary feature-edge extraction is guarded above 180,000 triangles for dense unselected bodies.
- Interior inspect is not a clipped section, wall-thickness analysis, ambient-occlusion calculation, or manufacturing result.
- Transparent Interior and X-ray bodies can show ordinary real-time depth-sorting artifacts.
- Color and contrast vary with monitor calibration, browser color handling, theme, and body color.

## Interface and responsive behavior

The v0.37.0 viewport and UI cleanup gives the canvas priority, but it does not remove the inherent density of a CAD tool.

- At constrained widths, modeling and drawing command groups scroll horizontally inside their own toolbar rather than shrinking or overlapping.
- Tablet and mobile layouts expose Shapes, Inspect, and History as drawers; not every panel is visible simultaneously.
- Panel, outline, theme, and workspace-mode preferences are stored in browser-local storage and can be removed by site-data cleanup.
- Canvas Focus is intentionally session-only so a later visit does not appear to be missing panels.
- Touch viewing and light editing are supported, but precision topology selection and dense drafting remain best with a mouse, trackpad, or stylus.
- The v0.37.0 renderer uses `PCFShadowMap`; the earlier inherited `PCFSoftShadowMap` warning is no longer expected.

## Browser qualification

The v0.37.0 sketch workflow was exercised in headed Chromium with a deterministic exact-mesh worker adapter for repeatable interface assertions. A separate headed-browser suite loaded the unmodified production geometry-worker logic and exact packaged Manifold WebAssembly bytes, reconstructed exact geometry, opened a face-supported sketch with exact underlay, and completed a negative cut. Firefox and Safari/WebKit runtimes were not available in the release container and are not claimed as tested. Real-device Gecko and WebKit qualification remains part of Batch 30 public-beta hardening.

## Local storage and offline use

Browser storage can be removed by site-data clearing, private browsing, storage pressure, browser cleanup, or operating-system cleanup. Export `.benchcad` files for durable backups.

The service worker requires HTTPS or localhost in normal browser security models. A first successful network load is required before the complete shell is available offline.

## STEP and analytic interchange

STEP export remains deferred. BENCHCAD does not wrap triangle meshes in a STEP-like file and claim analytic solid interoperability. Reliable STEP output requires a trustworthy boundary-representation solid model and persistent topology naming.

## Fabrication responsibility

Manufacturing readiness checks and drawing diagnostics are screening tools. They do not replace engineering review, tolerance analysis, material/process verification, machine setup, code compliance, or inspection planning.
