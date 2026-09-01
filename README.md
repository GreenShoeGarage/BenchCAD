# BENCHCAD v0.31.0 — Batch 27

BENCHCAD is a local-first, browser-based three-dimensional CAD workbench built around approachable solid modeling and an editable feature timeline. This prebuilt release runs from an ordinary static web folder and does not require an account, backend, cloud database, telemetry service, Node.js, or a build step.

## Deploy the prebuilt application

Copy **the contents of this folder** into the intended static directory. `index.html` must remain beside `sw.js`, `manifest.webmanifest`, and the `assets` folder.

The package uses only relative runtime paths. It may therefore be hosted at a domain root or a nested path such as:

```text
https://example.com/projects/benchcad/
```

A normal HTTP or HTTPS host is recommended. Service workers do not operate from `file://`, so opening `index.html` directly provides the application but not full installable/offline caching behavior. A local static server may also be used for testing.

## Batch 27: named parameters and expressions

This release adds a project-level **Parameters** workbench without taking away direct numeric editing.

- Create named project parameters such as `width`, `wall`, and `inside`.
- Use safe expressions such as `width - 2 * wall`.
- Use `+`, `-`, `*`, `/`, `%`, and exponentiation with parentheses.
- Use supported functions including `min`, `max`, `abs`, `round`, `floor`, `ceil`, `sqrt`, `pow`, and common trigonometric functions.
- Use explicit unit literals including `mm`, `cm`, `in`, `m`, `deg`, and `rad`.
- Link body width, depth, height, position, and rotation fields to expressions.
- Rebuild driven values when source parameters change.
- Detect duplicate names, unknown references, invalid expressions, division by zero, non-finite results, and dependency cycles before committing.
- Preserve ordinary numeric editing: directly entering a number removes only that property’s parameter link and keeps the entered value.
- Serialize parameter definitions and bindings in the native BENCHCAD project.

Example:

```text
width  = 50
wall   = 2.4
inside = width - 2 * wall
```

Binding a body width to `inside` produces `45.2`. Changing `width` to `60` rebuilds that driven body width to `55.2`.

## Batch 27: manufacturing-readiness workbench

The new **Manufacture** command runs local screening against the current visible design or current selection.

- Per-body mesh integrity checks use the same viewport geometry used for STL, OBJ, and 3MF export.
- Checks cover open and non-manifold geometry, winding conflicts, degenerate triangles, zero-volume bodies, recognized thin walls and small features, unsupported-overhang area, low-draft area, and possible body interference.
- Process presets cover FDM printing, resin printing, CNC machining, molding/casting, and generic mesh export.
- Minimum wall, minimum feature, maximum overhang, minimum draft, and interference tolerance remain editable.
- Manufacturing findings are separated into errors, warnings, and informational items.
- Reports may be exported locally as JSON or printable HTML.
- Manufacturing preflight is integrated with STL, OBJ, and 3MF export. Blocking mesh problems require explicit acknowledgement instead of being silently ignored.
- Each report explains the scope and limits of its checks; it is a design-screening aid rather than manufacturing certification.

## Batch 27: DXF workflow

- Import ASCII DXF as an editable BENCHCAD sketch.
- Supported entities: `LINE`, `POLYLINE`, `LWPOLYLINE`, `CIRCLE`, `ARC`, and `POINT`.
- Read `$INSUNITS` for inches, millimeters, centimeters, and meters.
- Warn when units are missing or unsupported entities are skipped.
- Export selected sketches and extruded body profiles as unit-aware ASCII DXF.
- Preserve outer profiles and profile holes on separate layers.
- Export drawing sheets as DXF in millimeters, including visible lines, hidden lines, and annotation text.

## Batch 27: fabrication-oriented features

- **Thin Extrude** creates real hollow extrusion geometry from one closed profile. Inside, centered, and outside wall placement remain editable timeline parameters.
- **Rib / Web** widens an open sketch centerline into a closed profile and extrudes it as actual geometry.
- **Cosmetic and represented threads** store designation, diameter, pitch, length, axis, handedness, and internal/external metadata.
- Represented threads appear in the viewport and manufacturing reports but are deliberately excluded from STL, OBJ, and 3MF mesh output. BENCHCAD does not falsely present annotation geometry as a true helical modeled thread.

## STEP and boundary-representation decision

STEP export remains deliberately deferred. BENCHCAD currently reconstructs manifold triangle meshes. Reliable STEP output requires analytic boundary-representation faces, edges, solids, and persistent topology naming. This release does not place triangle meshes inside a STEP-like container and label that as trustworthy solid CAD interchange.

## Project compatibility and migration

- Application version: **0.31.0**
- Native project schema: **5**
- Existing schema-v4 projects are migrated locally when opened.
- Migration adds empty named-parameter and parameter-binding stores while preserving existing geometry, features, bodies, component organization, manufacturing metadata, and timeline history.
- Imported projects are validated before replacing the current work.
- Keep exported `.benchcad` backups for important projects; browser storage can be removed by browser or operating-system cleanup.

## Privacy and local storage

BENCHCAD does not require a login and does not upload model geometry, filenames, previews, parameters, reports, or usage data. Projects are stored in the browser’s IndexedDB database and may also be exported manually as BENCHCAD project archives.

Use the application’s project export and named checkpoint features for durable backups. Clearing site data removes locally stored projects for that site origin.

## Offline operation

When hosted over HTTP or HTTPS, `sw.js` precaches the application JavaScript, stylesheet, geometry and import workers, Manifold WebAssembly geometry kernel, manifest, and icons. After one successful load, the application shell can reopen without a network connection, subject to browser storage policies.

## Batch 27 validation

The release gate covered:

- Main application, geometry worker, import worker, and service-worker JavaScript syntax.
- Complete native bundle dependency resolution with no unresolved module stubs.
- Named-expression parsing, functions, units, unknown-reference handling, cycle detection, and non-finite-result rejection.
- Parameter application to body dimensions, position, and rotation.
- Direct-edit link removal behavior.
- Schema-v5 serialization and schema-v4 migration.
- DXF parsing, unit conversion, supported entity handling, warnings, profile holes, and drawing-sheet output.
- Thin Extrude profile offset and collapse detection.
- Rib / Web generation from open centerlines.
- Watertight and invalid mesh diagnostics.
- Manufacturing wall, feature, overhang, draft, interference, blocking, JSON, and HTML report behavior.
- Browser workflow for creating parameters, binding a body dimension, rebuilding from a changed source parameter, returning a driven field to direct editing, and opening the manufacturing workbench.
- Static hosting from a nested subdirectory.
- Service-worker cache coverage, relative runtime paths, ZIP-root structure, and SHA-256 manifest.

See `BATCH27-TESTS.txt` for the release-specific checklist.

## Important limitations

The manufacturing report does not simulate support generation, thermal distortion, material shrinkage, cutter access, cutter reach, workholding, feeds and speeds, nesting, process qualification, or every local wall thickness in arbitrary imported meshes. Confirm thresholds against the actual machine, process, material, and operator.

DXF support is intentionally focused on common ASCII two-dimensional entities. Binary DXF, arbitrary three-dimensional DXF, splines, hatches, dimensions, blocks, and every vendor extension are not claimed as fully supported.

BENCHCAD remains a lightweight maker-oriented modeling workbench rather than a full boundary-representation mechanical CAD system.

## Included files

```text
index.html
manifest.webmanifest
sw.js
README.md
RELEASE-NOTES.md
BATCH27-TESTS.txt
SHA256SUMS.txt
assets/
  benchcad-v0.31.0.js
  benchcad-v0.31.0.css
  geometry.worker-BwAX3YFX.js
  geometry.worker-BwAX3YFX.js.map
  import.worker-4ZIJcZ3b.js
  import.worker-4ZIJcZ3b.js.map
  manifold-BE4c7gO-.wasm
```
