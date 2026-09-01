# BENCHCAD v0.36.0 — UI/UX Consolidation

BENCHCAD is a local-first, browser-based three-dimensional Computer-Aided Design workbench. It combines approachable solid modeling, an editable feature timeline, exact numeric input, local project persistence, manufacturing screening, and associative technical drawings.

The prebuilt application runs from an ordinary static web folder. It does not require an account, backend, cloud database, telemetry service, Node.js, or a build step.

Version 0.36.0 is an overall interface cleanup and workflow-consolidation release. It reduces command duplication, gives the modeling canvas more room, improves the hierarchy of the Shape Library and Inspector, reorganizes dense drawing commands, and turns narrow desktop and tablet layouts into usable drawer-based workspaces instead of compressed multi-column panels.

The next planned development stage is **Batch 29 — Large-Model Performance**.

## Release identity

- Application version: **0.36.0**
- Project schema: **9**
- Drawing schema: **5**
- Deployment: prebuilt static files
- Privacy: local-first, no telemetry
- Runtime dependencies: included in this package
- Project migration required: **no**

## Interface consolidation

### Command bar

- Consolidated theme, recovery/storage, help, layout reset, grid visibility, and canvas focus into one clearly labeled utility menu.
- Shortened the brand subtitle and reduced command-bar height and padding.
- Kept Model/Drawing, Maker/Advanced, units, parameters, undo/redo, project, and export commands in stable locations.
- Removed the duplicate top-level grid command; grid visibility now lives with viewport display controls.

### Modeling workspace

- Added **Canvas Focus** (`Shift+F`) to temporarily hide the Shape Library, Inspector, Component Browser, and Feature Timeline without changing the project. Press `Escape` or `Shift+F` to leave focus mode.
- Added **Restore workspace panels** to recover the standard layout in one action.
- Persisted panel visibility, Component Browser visibility, theme, and Maker/Advanced mode as browser-local interface preferences. Focus mode remains session-only by design.
- Reduced the default Feature Timeline height and tightened feature cards and playback controls.
- Preserved the repaired three-cell Components / Occurrences / Joints summary without allowing it to overlap the timeline.
- Simplified viewport status to visible bodies, feature count, and units; detailed assembly counts remain available in the tooltip.
- Reorganized model commands into clearer tool groups with a deliberate horizontal-scroll fallback on narrow screens rather than overlapping or shrinking controls into illegibility.

### Shape Library and Inspector

- Promoted Imported Assets, Favorites, and Recently Used into a compact shelf row.
- Changed primitives to larger, readable two-column cards on desktop.
- Increased heading, input, and section spacing in the Inspector while reducing decorative chrome.
- Kept collapse controls available and synchronized with the persistent layout preference.

### Tablet and mobile behavior

- At 900 pixels and below, Shapes, Inspect, and History become explicit workspace drawers above a full-width canvas.
- The Feature Timeline opens as a bottom drawer instead of permanently consuming modeling height.
- Mobile command-bar content is progressively reduced while project, workspace, unit, and settings access remain available.
- Dense modeling tool groups remain horizontally scrollable; no page-level horizontal overflow is introduced.

### Technical Drawings

- Replaced the dense drawing toolbar with three grouped menus: **Views**, **Annotate**, and **Export**.
- Views now collects orthographic, projected, section, and Detail commands.
- Annotate now collects overall dimensions, projected-geometry picking, annotation type, referenced annotation creation, and notes.
- Export now collects current-sheet SVG/DXF/PDF plus complete drawing-set PDF.
- The drawing browser, sheet canvas, and inspector have clearer widths and spacing, with a drawing-specific Canvas Focus mode.
- All Technical Drawings 2.0 geometry, associativity, integrity blocking, and export behavior remain unchanged.

## Validation

The release package includes machine-readable reports for:

- **33/33** responsive UI/UX browser checks across 1440, 1280, 1024, 820, and 390 pixel layouts.
- **7/7** production-bundle checks using the real geometry worker and Manifold WebAssembly kernel.
- **28/28** retained Technical Drawings 2.0 browser regressions, including Detail views and matching SVG, DXF, and PDF primitive signatures.
- **28/28** static application-shell, relative-path, syntax, schema, and runtime-asset checks recorded in `STATIC-PACKAGE-TESTS.json`; final ZIP-root and archive integrity are checked after packaging.

See `UIUX-CONSOLIDATION-TESTS.json`, `ACTUAL-WORKER-TESTS.json`, `V0.36.0-DRAWING-REGRESSION.json`, `STATIC-PACKAGE-TESTS.json`, and `UIUX-CONSOLIDATION-TESTS.txt`.

## Trusted drawing envelope

The drawing system currently supports:

- Exact reconstructed mesh sources only.
- Front, back, top, bottom, left, right, and isometric views.
- Depth-aware visible/hidden edge splitting, including occlusion between bodies.
- Silhouette, tangent-edge, hidden-line, and crease-angle controls.
- Axis-aligned clipped full sections with closed material-region hatching.
- Parent-view cutting-plane lines, arrows, and labels.
- First-angle and third-angle projected-view placement.
- Persistent horizontal and vertical projected-view alignment.
- Selectable projected edges and vertices.
- Conservative selectable mesh circles.
- Semantic hole, Boolean-hole, thread, and axis entities.
- Overall, horizontal, vertical, aligned, angular, and ordinate dimensions.
- Diameter and radius leaders.
- Center marks and centerlines.
- Hole, counterbore/countersink, and thread callouts when source metadata exists.
- Parent-linked circular and rectangular Detail crops.
- Fixed or associative Detail-region centers.
- Parent-view crop boundaries, leaders, bubbles, and associative Detail labels.
- Independent Detail-view scales and optional child crop frames.
- Printable-area, title-block, view, note, and annotation collision diagnostics.
- Notes, editable title blocks, multiple sheets, SVG, DXF, and PDF output.
- Deterministic drawing signatures embedded across SVG, DXF, and PDF output.
- Explicit unresolved-reference and reviewed-repair workflow.

BENCHCAD blocks fabrication export when a source, projected entity, annotation, section, parent relationship, or view-alignment relationship cannot be resolved.

## Deploy the prebuilt application

Extract the archive and copy **its contents** into the intended web directory. `index.html` must remain beside `sw.js`, `manifest.webmanifest`, and the `assets` folder.

All runtime URLs are relative, so the same files can be hosted at a domain root or a nested path such as:

```text
https://example.com/projects/benchcad/
```

For Green Shoe Garage, copy the extracted contents directly into the server directory mapped to:

```text
https://greenshoegarage.com/projects/benchcad/
```

Use HTTP or HTTPS. Service workers and Web Workers are most reliable over HTTPS or localhost. To test locally:

```bash
cd path/to/extracted/BENCHCAD
python3 -m http.server 8080
```

Then open:

```text
http://localhost:8080/
```

No compilation is required to use the packaged application.

## Batch 28C: projected entities

### Exact edge identities

The Batch 28B projection engine can split one source edge into several visible and hidden intervals. Batch 28C preserves the original source-edge identity across those intervals.

Each projected source edge carries:

- Source body identifier.
- Canonical source-edge identifier.
- Three-dimensional source endpoints.
- Projected endpoints and direction.
- Visibility and edge classification.
- Geometry signature used for conservative recovery.

Projected vertices are generated from the same source endpoints. Entity identifiers are deterministic for an unchanged exact mesh and view definition.

### Semantic entities

Some drawing references are more meaningful than anonymous mesh topology. BENCHCAD therefore emits semantic entities for:

- Modeled holes.
- Modeled thread specifications.
- Suitable primitive circular geometry.
- Cylindrical axes.
- Consumed cylindrical Boolean hole tools.

A consumed Boolean hole is associated with the surviving result body. This permits a final part drawing to retain a hole callout without exposing the consumed tool as an independent output body.

### Conservative mesh-circle detection

A closed projected mesh loop can be offered as a circle only when its point distribution, radius variation, closure, and projected bounding box agree with a circular interpretation.

This qualification is intentionally strict. A rounded rectangle is not presented as a circle merely because it contains curved corners. When BENCHCAD cannot establish a trustworthy circular entity, diameter/radius and center annotations remain unavailable for that loop.

## Batch 28C: associative annotations

### Overall dimensions

Overall Width and Height remain attached to the current projected envelope of the view. They do not require an individually selected entity.

### Edge and vertex measurements

The Measure menu supports:

- Horizontal distance.
- Vertical distance.
- Aligned distance.
- Angle between compatible projected edges.
- X ordinate.
- Y ordinate.

The selected projected entities become persistent references in the dimension record. Values are regenerated from the resolved geometry rather than copied as static text.

### Radial and center annotations

Diameter and Radius require a selected circle or hole entity. Center Mark and Centerline require suitable circular geometry or an axis.

These annotations no longer use the complete view's bounding rectangle. Their value and center are obtained from the referenced entity.

### Hole callouts

A Hole Callout can include available modeled metadata such as:

- Diameter.
- Through or blind extent.
- Depth.
- Counterbore diameter and depth.
- Countersink diameter and angle.
- Feature label.

Rich callouts require semantic hole metadata. A generic imported mesh circle does not automatically acquire drilling semantics.

### Thread callouts

A Thread Callout uses BENCHCAD thread metadata, including designation, pitch, length, handedness, and internal/external role when available.

BENCHCAD does not infer a thread specification from a tessellated imported mesh.

## Selecting projected geometry

1. Rebuild the model until exact geometry reports ready.
2. Open the **Drawing** workspace.
3. Create or select a sheet.
4. Add a resolved drawing view.
5. Select the view and enable its projected-entity picker.
6. Filter the picker by Edge, Vertex, Circle, Hole, Thread, or Axis.
7. Click an entity. Hold Shift, Control, or Command to select additional entities.
8. Choose a compatible command from **Measure** or **Annotate**.
9. Adjust the annotation offset, precision, prefix, suffix, tolerance, or leader direction in the inspector.
10. Review Drawing Integrity before exporting.

Selection overlays are workspace aids and are not included in exported drawings.

## Persistent references

A drawing-schema-5 annotation reference can record:

```json
{
  "entityId": "projected-entity-id",
  "kind": "edge",
  "role": "first",
  "sourceBodyId": "body-id",
  "semanticId": null,
  "signature": "geometry-signature",
  "normalizedAnchor": [0.42, 0.61],
  "snapshot": {}
}
```

The actual record can contain additional review metadata. The important point is that a dimension is linked to geometry rather than storing only a displayed number.

Resolution order is conservative:

1. Exact entity identifier.
2. Semantic feature identifier.
3. Geometry signature.
4. Unique compatible nearby candidate offered for review.

BENCHCAD does not silently accept the fourth case.

## Broken-reference repair

When an upstream feature edit changes projected topology, an annotation can enter one of these states:

- **Resolved** - the intended entity was found.
- **Repairable** - one compatible nearby candidate was found and requires review.
- **Unresolved** - no candidate, an incompatible candidate, or multiple plausible candidates were found.
- **Unsupported** - a legacy annotation cannot be represented safely in drawing schema 5.

For a repairable annotation, inspect the suggested entity and select **Accept suggested repair** only when it is the intended feature. The inspector also supports manual reattachment to the currently selected compatible entity.

Until repaired, the sheet remains visibly blocked and SVG, DXF, and PDF export remain disabled.

## Batch 28D: associative Detail views

A true Detail view is created from a resolved orthographic parent. It stores a parent-view identifier, Detail label, crop shape, crop center, crop size, independent scale, and optional associative center reference.

### Circular and rectangular crops

- A circular crop uses a center and diameter.
- A rectangular crop uses a center, width, and height.
- Projected lines are clipped at the crop boundary rather than merely hidden behind a visual mask.
- Projected entities outside the region are excluded from the Detail view.
- A Detail view must overlap the parent view's projected geometry envelope.

### Parent relationship

BENCHCAD draws the crop boundary on the parent view together with a leader, Detail bubble, and label. The child view retains the parent's orientation and exact source-body set while using its own scale and sheet position.

The relationship becomes blocking when the parent is missing, unresolved, non-orthographic, differently oriented, or linked to a different source set. BENCHCAD does not silently convert a broken Detail into an independent enlarged view.

### Associative crop center

The crop center may be fixed in projected model coordinates or linked to a selected projected entity. When linked, the crop follows that entity while the reference remains resolvable. If the reference becomes ambiguous or unresolved, the Detail fails closed and drawing export is blocked until reviewed.

### Detail labels and frames

Detail labels are stored as relationship data, not decorative text. The parent bubble and child caption are generated from the same label. The child crop frame can be shown or hidden independently; hiding it does not change the clipping region.

## Batch 28D: sheet release diagnostics

BENCHCAD now reports advisory layout findings for:

- Views extending beyond the printable border.
- Views overlapping the title block.
- View-to-view overlap.
- Dimensions or notes extending beyond the printable border.
- Dimensions or notes overlapping the title block.
- Annotation-to-annotation overlap.
- Note-to-view overlap.

These findings are visible release warnings rather than automatic geometry edits. They do not block export because a deliberate overlap can be valid, but they must be reviewed before a drawing is issued. Unresolved model, view, section, Detail, or annotation relationships remain blocking errors.

## Qualified drawing output

The resolved drawing primitive stream is the common source for SVG, DXF, and PDF. BENCHCAD computes a deterministic signature from the sheet size and ordered primitives, embeds it in all three formats, and uses parity fixtures to verify that the outputs were generated from the same resolved drawing state.

This signature detects divergence between BENCHCAD's output paths; it is not a cryptographic signature, identity proof, or fabrication approval.

## Projection and section behavior retained from Batch 28B

### Depth-aware hidden-line removal

Candidate mesh edges are tested against projected mesh triangles. Edges are split where their visibility changes, allowing a nearer body to hide only the overlapping interval of a rear edge. Hidden intervals can be shown or suppressed per view.

### Edge presentation

Each view can control silhouettes, tangent edges, hidden lines, and the crease threshold. Tangent classification is facet-based because BENCHCAD currently reconstructs triangle meshes rather than analytic boundary-representation surfaces.

### Clipped full sections

A full section clips source meshes to an explicitly retained half-space. Supported cutting planes are normal to global X, Y, or Z. Triangle-plane intersections are stitched into closed loops, and hatch lines are clipped to material regions using even-odd filling so nested voids remain unhatched.

Open section chains, missed planes, invalid parent orientation, missing parents, and source-set mismatches are blocking integrity issues.

### Projected-view relationships

Top, bottom, left, and right views can be created from a selected parent using first-angle or third-angle convention. Horizontal and vertical relationships preserve the appropriate shared sheet coordinate. Missing parents, incompatible orientation pairs, and dependency cycles block export.

## Drawing integrity

A drawing sheet is not exportable when any blocking condition exists, including:

- No drawing views.
- Missing source body.
- Missing or invalid exact mesh.
- Partially resolved source set.
- Empty projection.
- Missing, ambiguous, or review-pending annotation reference.
- Unsupported legacy annotation.
- Invalid angular or radial entity combination.
- Section plane missing the model.
- Open section region.
- Missing or incompatible section parent.
- Source mismatch between section and parent.
- Missing projected-view parent.
- Incompatible projected-view alignment.
- Alignment dependency cycle.
- Missing or unresolved Detail parent.
- Detail parent orientation or source-set mismatch.
- Invalid or non-overlapping Detail crop region.
- Unresolved associative Detail-center reference.

Layout collisions and printable-area overflow are reported separately as review warnings. The last valid model geometry remains available. Drawing errors do not rewrite model history, invent substitute dimensions, or detach Detail views from their parents.

## Drawing support matrix

| Capability | v0.36.0 status | Export behavior |
|---|---|---|
| Cardinal and isometric projection | Exact mesh, depth-aware | Allowed when resolved |
| Cross-body occlusion splitting | Supported | Allowed |
| Hidden, silhouette, tangent, crease controls | Supported | Allowed |
| Axis-aligned full section | Clipped exact mesh | Allowed with valid closed regions and parent |
| Nested void hatching | Supported | Allowed |
| First-/third-angle projected placement | Supported | Allowed |
| Parent view alignment | Persistent and validated | Allowed |
| Select projected edges/vertices | Supported | Allowed |
| Select modeled holes/threads/axes | Supported | Allowed |
| Conservative closed mesh circle | Supported | Allowed when qualified |
| Overall width/height | Associative to view envelope | Allowed |
| Horizontal/vertical/aligned | Associative to selected geometry | Allowed when resolved |
| Angular dimension | Two compatible edges | Allowed when resolved |
| X/Y ordinate | Projected entity references | Allowed when resolved |
| Diameter/radius | Circle or hole reference | Allowed when resolved |
| Center mark/centerline | Circular or axis reference | Allowed when resolved |
| Hole callout | Modeled or recognized Boolean-hole metadata | Allowed when resolved |
| Thread callout | Stored thread metadata | Allowed when resolved |
| Reference-repair suggestion | Review required | Blocked until accepted |
| Enlarged view | Independent uncropped view retained for compatibility | Review warning |
| Circular Detail crop | Parent-linked and clipped | Allowed when resolved |
| Rectangular Detail crop | Parent-linked and clipped | Allowed when resolved |
| Associative Detail center | Projected-entity reference | Allowed when resolved |
| Detail source callout and label | Generated from parent relationship | Allowed when resolved |
| Independent Detail scale | Supported | Allowed |
| View/annotation overflow and collision checks | Advisory diagnostics | Allowed after review |
| Baseline/chain/GD&T/datum tools | Not implemented | Unavailable |
| Partial-arc dimensions | Not implemented | Unavailable |
| Offset/broken-out/aligned section types | Not implemented | Unavailable |

## Schema and migration

Project schema 9 and drawing schema 5 prevent older BENCHCAD deployments from silently reinterpreting Detail relationships and reference-rich drawing semantics.

When opening an older supported project, BENCHCAD:

- Preserves original model geometry, timeline order, components, manufacturing metadata, sheets, and annotations.
- Advances feature schema markers without changing feature order.
- Migrates drawing records to drawing schema 5.
- Preserves schema-8 projected-entity references and review state.
- Adds Detail relationship, crop, label, frame, and layout-diagnostic defaults.
- Converts pre-schema-9 placeholder `detail` records into honest independent `enlarged` views rather than pretending they are associative Detail views.
- Preserves legacy unreferenced radial annotations as unsupported review records when no valid entity reference exists.
- Records the migration in project history.

Export a `.benchcad` backup before major edits. Browser storage is not a substitute for a durable project backup.

## Batch 27 capabilities retained

### Named parameters and expressions

- Project-level named values and safe arithmetic expressions.
- Millimeter, centimeter, inch, meter, degree, and radian literals.
- Body dimension, position, and rotation bindings.
- Dependency evaluation, cycle detection, unknown-reference handling, and non-finite-result rejection.
- Direct numeric entry removes only the edited field's expression link.

### Manufacturing readiness

- FDM, resin, CNC, molding/casting, and generic mesh-export presets.
- Mesh integrity, zero-volume, thin-wall, minimum-feature, overhang, draft, and interference screening.
- Local JSON and printable HTML reports.
- Manufacturing preflight integrated with STL, OBJ, and 3MF export.

These are design-screening checks, not manufacturing certification.

### DXF and fabrication workflow

- ASCII DXF import for `LINE`, `POLYLINE`, `LWPOLYLINE`, `CIRCLE`, `ARC`, and `POINT`.
- `$INSUNITS` handling for common units.
- Editable sketch import.
- Sketch, profile, and drawing-sheet DXF output.
- Thin Extrude and Rib / Web features.
- Cosmetic and represented thread metadata.

Represented threads remain annotations and are excluded from STL, OBJ, and 3MF mesh output.

## STEP decision

STEP export remains deliberately deferred. BENCHCAD reconstructs manifold triangle meshes. Trustworthy STEP output requires analytic boundary-representation faces, edges, solids, and persistent topology naming. This release does not place triangle meshes in a STEP-like container and claim reliable solid interchange.

## Privacy and local storage

BENCHCAD does not require an account and does not transmit model geometry, filenames, previews, drawing contents, or usage telemetry.

Projects and preferences are stored locally in the browser. Use `.benchcad` project export for durable backup and transfer. Clearing site data, private browsing, storage pressure, or operating-system cleanup can remove local browser records.

## Offline operation

The service worker precaches:

- `index.html`.
- The application JavaScript and CSS.
- Geometry and import workers.
- The Manifold WebAssembly kernel.
- The web manifest and icons.

After one successful HTTP or HTTPS load, the application can reopen from cache. A new version uses a new cache name and removes earlier BENCHCAD application caches during activation.

## Validation performed

The v0.36.0 release was checked through four complementary gates:

- **33/33 responsive UI/UX browser checks** covering command consolidation, panel containment, Focus mode, drawing menus, and 1440/1280/1024/820/390 pixel layouts.
- **7/7 actual-worker checks** using the production bundle, real geometry worker, real Three.js viewport, and packaged Manifold WebAssembly kernel.
- **28/28 Technical Drawings 2.0 browser regressions** covering exact-mesh views, parent-linked Details, crop changes, layout diagnostics, and SVG/DXF/PDF output.
- **28/28 static package checks** covering root entry structure, relative asset paths, nested-path URL resolution, service-worker shell completeness, manifest paths, JavaScript syntax, schemas, and packaged runtime assets.

The drawing parity fixture retained the same deterministic primitive signature, `4dd91b27`, in SVG, DXF, and PDF. The package also retains the earlier Batch 28D deterministic release evidence: 59 Detail/output assertions, 70 projected-reference assertions, 65 projection/section assertions, and 18 Batch 27 fabrication regressions.

The release environment blocks direct browser navigation to local HTTP and `file:` URLs. Subdirectory behavior was therefore verified through relative-path resolution plus production browser runs using the same packaged bundle, workers, and WebAssembly bytes under a synthetic `/projects/benchcad/` base. Final ZIP structure and SHA-256 integrity are checked after packaging.

Live runtime qualification was completed with Chromium. Firefox and WebKit/Safari executable runtimes were not available in the release container, so their real runtime qualification remains part of Batch 30 public-beta hardening.

See the included JSON and text validation reports for the exact checks and results.

## Known limitations

Important limits include:

- Mesh topology is not analytic boundary-representation topology.
- Large upstream topology changes can require reviewed edge/vertex reattachment.
- Circle recognition is conservative and does not expose partial arcs.
- Imported mesh holes do not automatically acquire manufacturing semantics.
- Thread callouts require stored thread metadata.
- Detail crops are circular or rectangular in projected model space; freeform, broken-out, offset, and chained Detail regions are not implemented.
- Layout diagnostics are advisory and do not automatically arrange the sheet.
- Baseline, chain, datum, geometric-dimensioning-and-tolerancing, dual-unit, and inspection-balloon tools are not implemented.
- Sections remain global-axis full sections.
- Very dense drawings can be computationally expensive.
- Firefox and Safari/WebKit need real-device public-beta qualification.

See `KNOWN-LIMITATIONS.md` for the complete drawing-specific list.

## Troubleshooting

### A projected entity is not available

Confirm the source view is resolved and the entity filter is correct. For circles, use modeled hole or primitive semantics when available. A mesh loop that is incomplete, occluded, damaged, or not sufficiently circular is intentionally not offered.

### An annotation says Repair review required

Inspect the suggested candidate in the annotation inspector. Accept it only when it is the intended geometry. Otherwise select the correct compatible projected entity and use manual reattach.

### An annotation is unresolved

Return to the model and rebuild exact geometry. Confirm the source body still exists. In Drawing, select the annotation, inspect its missing references, and reattach them to current compatible entities. Ambiguous replacements are never accepted automatically.

### Diameter or hole callout is unavailable

Select a qualified Circle or Hole entity. A hole callout additionally requires modeled hole metadata or a recognized cylindrical Boolean-hole operand. A generic edge loop is not treated as a drilled feature.

### Export buttons are disabled

Open Drawing Integrity and inspect every blocking item. One unresolved view, section, Detail relationship, alignment, annotation, or repair review anywhere on the sheet keeps SVG, DXF, and PDF export disabled. Layout warnings remain exportable but require review.

### A section reports open regions

Repair the source mesh or move the cutting plane away from a degenerate vertex, edge, or coplanar condition. BENCHCAD does not invent a closed section from an open chain.

### A Detail view is unresolved

Select the Detail and verify that its parent is a resolved orthographic view with the same orientation and source bodies. Confirm the crop has a positive diameter or width/height and overlaps projected parent geometry. When the center is associative, repair or replace the center reference before export.

### A sheet reports overlap or printable-area warnings

Select the referenced view, dimension, or note and adjust its position, scale, crop, or annotation offset. These are advisory release findings, so BENCHCAD does not move drawing content automatically or silently block an intentional layout.

### An older deployment keeps loading

Hard-refresh the page. When necessary, remove the old BENCHCAD service worker and site cache, then reload v0.36.0 once while online.

### Offline mode does not install

Serve the files over HTTPS or localhost. Confirm service workers are allowed and every file listed in `sw.js` exists at the same relative path.

## Included files

- `index.html` - static entry point.
- `assets/benchcad-v0.36.0.js` - prebuilt application bundle.
- `assets/benchcad-v0.36.0.css` - prebuilt interface styles.
- `assets/geometry.worker-BwAX3YFX.js` - geometry reconstruction worker.
- `assets/import.worker-4ZIJcZ3b.js` - local import worker.
- `assets/manifold-BE4c7gO-.wasm` - Manifold geometry kernel.
- Worker source maps.
- `sw.js` - offline application-shell worker.
- `manifest.webmanifest` and icons.
- `VERSION.txt`.
- `RELEASE-NOTES.md`.
- `KNOWN-LIMITATIONS.md`.
- `BATCH28D-TESTS.txt` and `BATCH28D-TESTS.json` - retained Batch 28D release qualification.
- `UIUX-CONSOLIDATION-TESTS.txt` and `UIUX-CONSOLIDATION-TESTS.json` - targeted responsive layout and interaction results.
- `STATIC-PACKAGE-TESTS.json` - static application-shell and relative-path validation.
- `V0.36.0-DRAWING-REGRESSION.json` - retained Technical Drawings 2.0 browser regression.
- `SHA256SUMS.txt`.

## Roadmap

### Batch 28 - Technical Drawings 2.0

**Complete and retained in v0.36.0.** The completed envelope includes release repair, depth-aware projection, clipped full sections, projected-view alignment, persistent projected-entity references, associative dimensions and callouts, true parent-linked Detail crops, layout diagnostics, and qualified SVG/DXF/PDF output.

### Batch 29 - Large-model performance

Incremental drawing rebuilds, stronger result caching, selective body work, worker scheduling, viewport level-of-detail, cancellation, progress, and memory diagnostics.

### Batch 30 - Public-beta hardening

Recovery, storage failure, migration, import abuse, cross-browser, accessibility, mobile/tablet, offline, and UI consistency work.

### Batch 31 - v1.0 release candidate

Reference-project qualification, downstream viewer checks, deterministic reconstruction, final documentation, licensing review, and release packaging.
