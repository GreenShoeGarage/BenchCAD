# BENCHCAD v0.36.2 — Shell Interior Edge Visibility

Version 0.36.2 is a focused viewport-maintenance release built on the unchanged project-schema-9 and drawing-schema-5 core. It addresses the remaining readability problem in hollow parts: a correct shell could still look like a smooth open box with its inner floor perimeter and vertical cavity corners nearly invisible.

## Topology-derived cavity traces

- Adds a dedicated cavity-edge pass separate from the ordinary silhouette and crease-edge overlay.
- Classifies shared reconstructed-mesh edges by local concavity rather than treating every tessellation edge as design linework.
- Renders visible shell-cavity traces with a restrained two-tone treatment: a dark halo for separation and a pale core for legibility against both lit and shaded surfaces.
- Offsets the display traces slightly toward cavity air so coplanar depth testing does not bury the interior linework.
- Emphasizes the opening lip, inner floor perimeter, and vertical interior corners without modifying model geometry.
- Uses direct face-index lookup rather than repeated face scans when evaluating shared topology.

## Interior inspect

The viewport eye menu now contains a sixth display style:

- **Interior inspect** ghosts the outer shell, emphasizes inner surfaces, and draws dashed through-body cavity traces.
- A status indicator reports the number of cavity edges in the active view.
- The mode is browser-local, display-only, and never creates a feature, dirties the project, or changes export geometry.

Existing **Shaded + edges**, **Shaded**, **Technical**, **X-ray inspect**, and **Wireframe** modes remain available. Shaded + edges remains the default and now includes visible cavity traces for shell-like concave geometry.

## Performance guardrails

- Ordinary feature-edge extraction remains guarded at 180,000 triangles for dense unselected bodies.
- Shell-cavity extraction is skipped above 220,000 triangles.
- The display pass stops at 6,000 cavity-edge segments.
- These safeguards affect optional viewport linework only. Authoritative meshes, reconstruction, manufacturing checks, drawings, and exports remain unchanged.

## Compatibility

- Project schema remains **9**.
- Drawing schema remains **5**.
- Existing projects require no migration.
- The `.benchcad` archive structure is unchanged.
- Technical Drawings 2.0 semantics and cross-format output remain unchanged.
- Static root and nested-subdirectory deployment remain supported.

## Validation

- **30/30** focused production-browser shell-interior checks passed.
- The real geometry worker and packaged Manifold WebAssembly kernel reconstructed the tested open-top shell.
- The fixture produced **8 topology-derived cavity edges**.
- All six display styles produced distinct rendered frame hashes.
- **28/28** retained Technical Drawings 2.0 production-browser checks passed.
- SVG, DXF, and PDF retained the matching drawing primitive signature `4dd91b27`.
- No page errors, console errors, or console warnings were observed.
- The static bundle transformed **210 modules** with no compatibility stubs.

## Scope honesty

Interior inspect is not a true section, wall-thickness map, screen-space ambient occlusion pass, ray-traced renderer, or analytic boundary-representation topology viewer. It is a targeted engineering-legibility aid derived from the tessellated reconstructed mesh.

---

# BENCHCAD v0.36.1 — Viewport Legibility and Shell Inspection

Version 0.36.1 is a focused rendering and inspection maintenance release built on the unchanged project-schema-9 and drawing-schema-5 core. No project migration is required.

## Cavity-readable default rendering

- Replaced the prior flat-looking default with **Shaded + edges**.
- Added crease-based feature edges to clarify shell lips, internal corners, Boolean boundaries, and recessed geometry.
- Added a separate selected-body silhouette so selection remains visible without washing every internal edge in the selection color.
- Switched normal solid shading to physically based materials with restrained roughness, specular response, and tone-mapped highlights.
- Added balanced key, fill, rim, hemisphere, and ambient lighting for stronger face separation.
- Improved shadow bias and reduced floor-shadow opacity so contact shadows support the form instead of obscuring it.
- Uses `PCFShadowMap` directly, removing the previous runtime deprecation warning.

## Viewport display styles

The eye-shaped viewport display control now offers:

- **Shaded + edges** — default everyday modeling view.
- **Shaded** — clean surfaces without feature-edge overlays.
- **Technical** — neutral material with high-contrast edges.
- **X-ray inspect** — ghosted surfaces with through-body edges.
- **Wireframe** — triangle-mesh inspection.

The selected style is stored in local interface preferences. X-ray is a visual inspection aid; it is not a wall-thickness or manufacturability analysis.

## Performance guardrail

Crease-edge overlays are skipped for unselected bodies above 180,000 triangles. A selected body remains eligible for the inspection overlay so a dense scene does not force every mesh through the additional edge-generation path.

## Compatibility

- Project schema remains **9**.
- Drawing schema remains **5**.
- Existing projects require no migration.
- Technical Drawings 2.0 behavior and output semantics are unchanged.
- Static root and subdirectory deployment remain supported.
- The geometry worker, import worker, and Manifold WebAssembly kernel remain local and packaged.

## Validation

The focused production-browser test passed **30/30 checks**. It created a box, generated an open-top shell through the real geometry worker and packaged Manifold WebAssembly kernel, rendered all five display styles, confirmed five distinct frame hashes, checked responsive containment at 1200, 1024, 820, and 390 pixel widths, and observed no page errors or hard console errors.

Representative viewport screenshots and the machine-readable `VIEWPORT-RENDERING-TESTS.json` report are included in the complete archive.

---

# BENCHCAD v0.36.0 — UI/UX Consolidation

Version 0.36.0 is a broad interface cleanup built on the unchanged project-schema-9 and drawing-schema-5 modeling core. No project migration is required.

## Modeling workflow

- Consolidated secondary application commands into one utility menu.
- Added Canvas Focus with `Shift+F` and `Escape` exit behavior.
- Added one-action workspace-panel restoration.
- Persisted panel, theme, outline, and Maker/Advanced preferences locally.
- Moved grid visibility into viewport display controls.
- Reduced command-bar, timeline, and panel chrome while increasing control readability.
- Promoted shape shelves and changed primitive browsing to larger two-column cards.
- Simplified viewport status and improved Inspector hierarchy.
- Preserved the v0.35.1 three-cell assembly summary repair.

## Responsive workspace

- Shapes, Inspect, and History become drawers at tablet and narrow-desktop widths.
- Modeling and drawing canvases retain priority instead of being squeezed between fixed panels.
- Dense toolbars use contained horizontal scrolling, with no document-level horizontal overflow in the tested layouts.
- Mobile command-bar content is progressively simplified while core navigation remains accessible.

## Technical drawing workflow

- Consolidated drawing commands into Views, Annotate, and Export menus.
- Preserved orthographic/projected views, sections, associative references, dimensions, callouts, Detail views, release diagnostics, and SVG/DXF/PDF output.
- Added drawing-specific Canvas Focus and cleaned browser/inspector spacing.

## Compatibility

- Project schema remains **9**.
- Drawing schema remains **5**.
- Existing projects require no migration.
- Static root and subdirectory deployment remain supported.
- The geometry worker, import worker, and Manifold WebAssembly kernel remain local and packaged.

## Validation

- 33/33 responsive UI/UX browser checks passed.
- 7/7 real geometry-worker and Manifold WebAssembly checks passed.
- 28/28 retained Technical Drawings 2.0 browser regression checks passed.
- SVG, DXF, and PDF drawing exports retained the matching primitive signature `4dd91b27`.
- 28/28 static package, service-worker shell, relative-path, JavaScript syntax, schema, and runtime-asset checks passed; final ZIP integrity and root-level `index.html` were verified after packaging.

A single inherited Three.js warning notes that `PCFSoftShadowMap` is mapped to `PCFShadowMap`; it does not block modeling or export.

---

# BENCHCAD v0.35.1 - Assembly Summary Layout Hotfix

Version 0.35.1 is a focused interface repair built on the unchanged v0.35.0 Batch 28D geometry and drawing engine.

## Lower-left rail repair

- Replaced the single overflowing `COMPONENTS · OCCURRENCES · JOINTS` line with three independent summary cells.
- Gave each cell a compact uppercase label and a separate tabular count.
- Aligned the timeline summary header and Component Browser width to the shared `--left-w` workspace variable.
- Removed the former fixed 230 px mismatch against the 254 px normal rail and 220 px responsive rail.
- Added overflow containment and clean title truncation so the assembly summary cannot cover the Feature timeline heading.
- Added a descriptive accessible label and tooltip to the Component Browser toggle.
- Preserved the mobile timeline behavior, where the component outline remains intentionally unavailable.

## Compatibility

- Project schema remains 9.
- Drawing schema remains 5.
- Existing projects require no migration.
- Technical Drawings 2.0 behavior and export semantics are unchanged.
- Static root and subdirectory deployment remain supported.

## Targeted validation

The maintenance release passed **26/26 targeted interface checks**, including summary-cell separation, 254 px and 220 px rail alignment, 800 px minimum-desktop behavior, title isolation, toggle collapse/restore, mobile History behavior, application startup, Manifold WebAssembly readiness, and nested worker URL construction.

It also passed **12/12 nested application-shell checks** and a **27/27 Technical Drawings 2.0 browser regression**, including matching SVG, DXF, and PDF primitive signatures. The package includes the machine-readable results and a concise validation summary.

---

## v0.35.0 - Batch 28D Detail Views and Drawing Output Qualification

This release completes Batch 28D and closes the reopened Batch 28, Technical Drawings 2.0. It builds on the exact-mesh projection, clipped-section, projected-entity, and associative-annotation work delivered in v0.32.1 through v0.34.0.

## Release identity

- Application version: 0.35.0
- Project schema: 9
- Drawing schema: 5
- Deployment: prebuilt static application
- Runtime services: none required
- Privacy: local-first, no telemetry

## True associative Detail views

The former independent enlarged-view placeholder has been replaced by a real Detail relationship.

A Detail view now records:

- An orthographic parent-view identifier.
- An associative Detail label.
- A circular or rectangular crop shape.
- A fixed or projected-entity-linked crop center.
- Crop diameter, or crop width and height.
- An independent Detail scale.
- An optional visible child crop frame.
- The exact source-body set and inherited view orientation.

Projected linework is clipped at the crop boundary. Geometry and selectable projected entities outside the region are excluded instead of being covered by a decorative overlay.

## Parent-view callouts

A resolved Detail relationship generates:

- The crop boundary on the parent view.
- A source leader.
- A Detail bubble.
- A shared Detail label.
- A child caption identifying crop type and scale.

The parent callout and child caption are produced from the same stored label and relationship. A missing, unresolved, non-orthographic, differently oriented, or source-mismatched parent is a blocking drawing error.

## Associative crop centers

The Detail crop center may remain a fixed projected-model-space coordinate or reference a selected projected entity. A valid entity reference moves the Detail region when the referenced geometry moves.

An unresolved, ambiguous, or review-pending center reference blocks drawing output. BENCHCAD does not silently freeze the old center or attach the crop to a different entity.

## Layout and printable-area diagnostics

The drawing release check now reports advisory findings for:

- Views outside the printable border.
- Views overlapping the title block.
- View-to-view overlap.
- Dimensions and notes outside the printable border.
- Dimensions and notes overlapping the title block.
- Annotation-to-annotation overlap.
- Note-to-view overlap.

These are non-blocking warnings because some overlap can be intentional. BENCHCAD reports the condition but does not automatically rearrange an issued drawing. Geometry, reference, section, alignment, and Detail relationship failures remain blocking.

## Cross-format output qualification

SVG, DXF, and PDF now consume the same resolved drawing primitive stream. BENCHCAD computes a deterministic primitive signature and embeds it in each output format.

The release browser fixture generated:

- SVG signature: `4dd91b27`
- DXF signature: `4dd91b27`
- PDF signature: `4dd91b27`

A matching signature shows that each exporter received the same ordered sheet geometry and text. It is an internal parity aid, not a cryptographic signature or fabrication approval.

## Save, reopen, and migration

Schema-8 projects migrate locally to project schema 9 and drawing schema 5.

Migration:

- Preserves model geometry, timeline order, components, manufacturing metadata, drawing sheets, views, and annotations.
- Preserves Batch 28C projected-entity references and repair state.
- Adds Detail relationship, crop, label, frame, and layout defaults.
- Converts pre-schema-9 placeholder records named `detail` into independent `enlarged` views.
- Does not claim that a legacy enlarged view has a parent or crop relationship it never stored.
- Records the migration in project history.

New schema-9 Detail records reopen with their parent, crop, scale, label, and associative-center data intact.

## Export integrity

SVG, DXF, and PDF remain blocked when a sheet contains unresolved exact geometry, invalid source sets, broken annotation references, invalid sections, projected-view dependency failures, or broken Detail relationships.

Layout warnings are visible in the release check but remain advisory. The exported formats preserve the current reviewed layout exactly; BENCHCAD does not silently move content during export.

## Validation

The v0.35.0 package passed:

- 59 deterministic Batch 28D assertions.
- 70 retained Batch 28C reference and annotation assertions.
- 65 retained Batch 28B projection and section assertions.
- 18 retained Batch 27 fabrication and manufacturing tests.
- 27 production-bundle Chromium workflow checks.
- Targeted TypeScript compilation.
- Main application, geometry-worker, import-worker, and service-worker syntax checks.
- Real Three.js drawing-workspace rendering.
- Real Manifold WebAssembly reconstruction.
- Circular and rectangular Detail crop workflows.
- Parent-callout, child-frame, label, scale, and associative-center checks.
- Layout warning creation and clearance.
- Save/reopen and schema migration checks.
- SVG, DXF, and PDF browser download checks.
- PDF structural and rendered-page review.
- Nested `/projects/benchcad/` static hosting checks.
- Complete offline application-shell checks.
- Internal package checksum and ZIP-root checks.

The live runtime qualification was completed in Chromium. Firefox and Safari/WebKit executables were not available in the release environment, so their real runtime qualification remains scheduled for Batch 30 public-beta hardening.

## Batch 28 completion state

Technical Drawings 2.0 now includes:

1. Batch 28A: release repair and fail-closed drawing integrity.
2. Batch 28B: depth-aware projection, clipped sections, and projected-view relationships.
3. Batch 28C: persistent projected-entity references and associative dimensions/callouts.
4. Batch 28D: true Detail views, layout diagnostics, and qualified common-state SVG/DXF/PDF output.

The next roadmap stage is Batch 29, Large-Model Performance.
