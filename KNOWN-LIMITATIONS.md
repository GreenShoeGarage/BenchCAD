# BENCHCAD v0.36.3 Known Limitations

BENCHCAD v0.36.3 retains the completed Technical Drawings 2.0 roadmap, but it remains a lightweight mesh-based CAD system rather than a full analytic mechanical drafting package. Review every drawing before fabrication.

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

BENCHCAD v0.36.3 prioritizes modeling readability, but the viewport remains an engineering work view rather than a photorealistic or calibrated renderer.

- Display styles and lighting presets are independent browser-local preferences. They do not change authoritative geometry or exported files.
- **Workbench** is intentionally matte and neutral. Its soft contact shadow is an orientation cue, not a physically calibrated light simulation.
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

The v0.36.3 viewport and UI cleanup gives the canvas priority, but it does not remove the inherent density of a CAD tool.

- At constrained widths, modeling and drawing command groups scroll horizontally inside their own toolbar rather than shrinking or overlapping.
- Tablet and mobile layouts expose Shapes, Inspect, and History as drawers; not every panel is visible simultaneously.
- Panel, outline, theme, and workspace-mode preferences are stored in browser-local storage and can be removed by site-data cleanup.
- Canvas Focus is intentionally session-only so a later visit does not appear to be missing panels.
- Touch viewing and light editing are supported, but precision topology selection and dense drafting remain best with a mouse, trackpad, or stylus.
- The v0.36.3 renderer uses `PCFShadowMap`; the earlier inherited `PCFSoftShadowMap` warning is no longer expected.

## Browser qualification

The v0.36.3 lighting workflow was exercised in Chromium with real Three.js and Manifold WebAssembly. Firefox and Safari/WebKit runtimes were not available in the release container and were not falsely reported as tested. Real-device Gecko and WebKit qualification remains part of Batch 30 public-beta hardening.

## Local storage and offline use

Browser storage can be removed by site-data clearing, private browsing, storage pressure, browser cleanup, or operating-system cleanup. Export `.benchcad` files for durable backups.

The service worker requires HTTPS or localhost in normal browser security models. A first successful network load is required before the complete shell is available offline.

## STEP and analytic interchange

STEP export remains deferred. BENCHCAD does not wrap triangle meshes in a STEP-like file and claim analytic solid interoperability. Reliable STEP output requires a trustworthy boundary-representation solid model and persistent topology naming.

## Fabrication responsibility

Manufacturing readiness checks and drawing diagnostics are screening tools. They do not replace engineering review, tolerance analysis, material/process verification, machine setup, code compliance, or inspection planning.
