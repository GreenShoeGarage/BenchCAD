# BENCHCAD v0.36.1 — Viewport Clarity and Shell Inspection

Version 0.36.1 is a focused rendering and inspection maintenance release built on the unchanged project-schema-9 and drawing-schema-5 core. It addresses poor cavity readability in shelled and recessed parts without changing model geometry, feature history, project serialization, or drawing semantics.

## Viewport display styles

The viewport eye menu now provides five explicit display styles:

- **Shaded + edges** — the new default, combining physically based shaded surfaces with geometry-derived feature edges for everyday modeling.
- **Shaded** — clean surfaces without feature-edge overlays.
- **Technical** — neutralized materials and high-contrast edges for shape inspection when authored colors obscure form.
- **X-ray inspect** — ghosted surfaces plus through-body feature edges for viewing cavities, bores, wall intersections, and obscured geometry.
- **Wireframe** — triangle-mesh topology inspection.

The selected display style is stored only as a browser-local interface preference. It does not alter the project, body material settings, feature history, or exported model.

## Rendering changes

- Replaced the inherited viewport material presentation with `MeshPhysicalMaterial`-based body materials.
- Added ACES filmic tone mapping and sRGB output handling.
- Rebalanced hemisphere, ambient, key, fill, and rim lighting for stronger face separation.
- Improved contact-shadow behavior in opaque shaded modes.
- Added geometry-derived edge overlays for shaded-edge, Technical, X-ray, and hole-tool presentation.
- Added a stronger cyan selected-body outline so selection remains distinct from ordinary feature edges.
- Preserved authored body opacity and the separate translucent treatment of hole tools.
- Disabled contact shadows in X-ray and Wireframe modes, where they reduce rather than improve legibility.
- Replaced the deprecated inherited soft-shadow setting with `PCFShadowMap`.

## Dense-mesh safeguard

Feature-edge extraction can be expensive because it analyzes the displayed mesh. BENCHCAD therefore skips ordinary edge extraction for an unselected body above 180,000 triangles. This limit affects the optional display overlay only; it does not change the body mesh, feature history, manufacturing export, drawing projection, or project data.

## Shell-inspection workflow

For a shelled enclosure or open box:

1. Use **Shaded + edges** to inspect the shell lip, interior corners, wall intersections, and opening boundary.
2. Use **Technical** when the body color creates weak contrast.
3. Use **X-ray inspect** to reveal through-body feature edges and obscured cavity structure.
4. Use a true section or technical drawing when a measured cut plane is required. X-ray mode is not a section-analysis substitute.

## Compatibility

- Application version: **0.36.1**
- Project schema: **9**
- Drawing schema: **5**
- Project migration required: **no**
- Server or backend required: **no**
- Build step required for the packaged release: **no**

Existing `.benchcad` projects reopen without schema conversion. Viewport-style preference is separate from project storage.

## Validation

The v0.36.1 production bundle passed **30/30** focused browser checks using the actual Three.js viewport, geometry worker, and packaged Manifold WebAssembly kernel. The test created a fresh project, reconstructed a box and shell feature, exercised all five display modes, confirmed five distinct rendered frame hashes, checked responsive access at 1200, 1024, 820, and 390 pixels, and detected no page errors, console errors, or console warnings.

Retained validation evidence from v0.36.0 and Batch 28 remains included for UI behavior, actual worker reconstruction, Technical Drawings 2.0, and static deployment. A new final package report verifies v0.36.1 asset references, schemas, service-worker coverage, syntax, relative paths, screenshots, and archive structure.

See:

- `VIEWPORT-RENDERING-TESTS.json`
- `VIEWPORT-RENDERING-TESTS.txt`
- `V0.36.1-PACKAGE-TESTS.json`
- `KNOWN-LIMITATIONS.md`

## Deployment

Extract the ZIP and copy its contents into the static directory that should serve BENCHCAD. Keep `index.html`, `sw.js`, `manifest.webmanifest`, and `assets/` together.

The package uses relative runtime URLs and can be deployed at a domain root or a nested path such as:

```text
https://greenshoegarage.com/projects/benchcad/
```

After replacing an older deployment, perform a hard refresh. If v0.36.0 remains visible, remove the old BENCHCAD service worker/site cache once and reload while online. The v0.36.1 service worker uses a new cache namespace and removes older BENCHCAD application caches during activation.

## Scope

This release improves real-time form legibility; it does not add photorealistic rendering, screen-space ambient occlusion, ray tracing, texture authoring, wall-thickness analysis, or arbitrary viewport sections. Those capabilities are not claimed.

Batch 29 — Large-Model Performance remains the next roadmap stage. Version 0.36.1 is a maintenance release and does not begin that batch.

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
