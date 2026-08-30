# BENCHCAD

BENCHCAD is a lightweight, local-first browser CAD workbench that combines approachable shape-based modeling with an editable construction timeline. Every persistent modeling action is stored as a feature; generated meshes are derived results, not the project’s source of truth.

Version: **0.1.0**  
Project schema: **1**

## What works in this release

- Click or drag primitives onto the workplane: box, cylinder, sphere, cone, torus, wedge, pyramid, tube, rounded box, polygonal prism, and text proxy.
- Orbit, pan, zoom, standard views, fit all, perspective, wireframe, shadows, grid, origin, and axis display.
- Exact numeric dimensions, position, rotation, shape sides, names, visibility, locking, and solid/hole roles.
- Multi-selection from the viewport or object outline.
- Manifold WebAssembly Boolean subtraction and union for supported primitive geometry in a dedicated Web Worker.
- Persistent feature history with stable project, feature, and body identifiers.
- Rollback, forward reconstruction, step controls, playback, speed control, suppression, and named checkpoints.
- Earlier-feature editing followed by deterministic downstream reconstruction.
- Explicit branch handling when creating geometry while rolled back.
- Command undo/redo kept separate from construction history.
- IndexedDB autosave and recent-project dashboard.
- ZIP-compatible `.benchcad` project archives with manifest, project, history, and checkpoint data.
- Project validation, schema migration helpers, timeline JSON reports, offline service worker, and installable web manifest.
- Maker and Advanced interface modes, dark/light/high-contrast themes, reduced-motion support, keyboard access, and mobile panel layouts.
- A prebuilt static distribution that uses relative paths and can run at a domain root or in a subdirectory.

## Privacy model

BENCHCAD does not require an account, backend, cloud database, subscription, analytics, advertising, or telemetry. Project history and project metadata are stored in the browser’s IndexedDB database. Manual `.benchcad` exports are written only when you request them.

The application does not upload project names, geometry, previews, imported filenames, or usage data. A static host receives only ordinary requests for application files.

Browser storage is not a substitute for a backup. Browser or operating-system cleanup can remove IndexedDB data. Export important work as a `.benchcad` archive.

## Use the prebuilt application

The `prebuilt/` directory is the ready-to-host release. It contains `index.html`, compiled JavaScript and CSS, the Manifold WebAssembly geometry engine, the service worker, and the web manifest.

1. Copy everything *inside* `prebuilt/` into an ordinary static web directory.
2. Serve the directory over HTTP or HTTPS.
3. Open `index.html` through the server.

Do not double-click `index.html` and expect all features to work through a `file://` URL. Browsers restrict Web Workers, WebAssembly, IndexedDB, and service workers in that context.

## Static hosting

### Domain root

Copy the contents of `prebuilt/` to your public root:

```text
public_html/
├── index.html
├── assets/
├── favicon.svg
├── manifest.webmanifest
└── sw.js
```

### Subdirectory

Copy the same files to a subdirectory:

```text
public_html/projects/benchcad/
├── index.html
├── assets/
├── favicon.svg
├── manifest.webmanifest
└── sw.js
```

Then open `https://example.com/projects/benchcad/`. The build uses relative asset paths (`./`) so no path rewriting is required.

### Quick local server

Python:

```bash
cd prebuilt
python3 -m http.server 8080
```

Open `http://localhost:8080/`.

Node.js is not required to use the prebuilt release.

## Development

Requirements:

- Node.js 22.13 or newer
- npm

Install, run, test, and build:

```bash
npm ci
npm run dev
npm test
npm run lint
npm run build:standalone
```

`npm run build:standalone` creates the static `prebuilt/` directory. The Sites-hosted application uses the repository’s normal `npm run build` lifecycle.

## Modeling workflow

1. Start from an empty project or open a sample.
2. Click or drag a shape onto the workplane.
3. Select it and enter exact dimensions in the Inspector.
4. Add a second shape and set it to **Hole** when it should remove material.
5. Shift-select the solid and hole.
6. Choose **Group / Boolean**.
7. Drag the amber history marker backward to inspect an earlier state.
8. Select an earlier feature tile and edit its parameters.
9. Return the marker to the end to see downstream features rebuild.
10. Export a `.benchcad` backup.

### Undo versus timeline history

Command undo/redo reverses recent editing commands. It does not add an inverse feature.

The feature timeline is the persistent construction recipe. It records creation, translation, rotation, resize, role changes, Boolean operations, duplication, renaming, visibility, deletion, and other design-defining operations. Moving its marker reconstructs the model at a historical point without deleting later work.

### Working in the past

If you insert a new shape while the marker is before the end, BENCHCAD asks you to:

- return to the end and add the feature there;
- create a new project branch from the current historical point; or
- explicitly discard the hidden future.

Future history is never overwritten silently.

## Project archive format

A `.benchcad` file is a ZIP-compatible archive. Schema version 1 contains:

```text
manifest.json       Format, schema, application version, and project ID
project.json        Authoritative project document
history.json        Feature history for inspection and recovery
checkpoints.json    Named historical checkpoints
README.txt          Plain-language identification
```

Each feature contains stable IDs, type, name, sequence, inputs, outputs, parameters, suppression and status data, timestamps, and an optional output-body snapshot.

Before replacing the current session, the importer opens the archive, locates `project.json`, and validates its schema. Unsupported or corrupt projects are rejected without replacing the open project. Migration helpers upgrade the legacy schema-0 shape to schema 1 while preserving IDs and history order.

## Autosave and recovery

- Changes enter **Unsaved**, then **Saving**, then **Saved locally** states.
- Projects are stored by stable project ID in IndexedDB.
- The dashboard lists the most recently modified projects.
- **Fresh Start** creates another project without deleting prior work.
- **Clear local data** requires confirmation and clears BENCHCAD’s local project database.
- Manual `.benchcad` exports are the durable backup and transfer mechanism.

If a reconstruction fails, BENCHCAD keeps the last valid feature-derived bodies, marks the engine state as an error, reports the reason, and leaves project history intact. Suppress or edit the failed feature, roll back, or reopen an exported project.

## Keyboard shortcuts

| Command | Shortcut |
| --- | --- |
| Undo command | `Command/Ctrl + Z` |
| Redo command | `Shift + Command/Ctrl + Z` |
| Export project | `Command/Ctrl + S` |
| Duplicate selection | `Command/Ctrl + D` |
| Delete selection | `Delete` or `Backspace` |
| Timeline step backward/forward | `Alt/Option + Left/Right` |
| Timeline beginning/end | `Home` / `End` |
| Play or pause history | `Space` |
| Focus shape search | `/` |
| Clear selection | `Escape` |

Orbit uses the primary pointer button, pan uses the secondary pointer button, and zoom uses the wheel or trackpad gesture. Shift, Command, or Ctrl adds to viewport and outline selection.

## Import and export

Current import entry points accept `.benchcad`, STL, OBJ, SVG, and 3MF selections. The version 0.1 mesh-import path records source filename, format, byte size, repair status, and a scale-review warning, then creates a review proxy body. Source mesh tessellation and repair are intentionally not applied silently.

Current export formats:

- `.benchcad` complete project archive
- JSON feature timeline report

STL, 3MF, OBJ, SVG profile, and viewport PNG exporters are planned for the next geometry/export batch. Until then, `.benchcad` is the authoritative backup format.

## Browser support

Current desktop Chrome, Edge, Firefox, and Safari are the primary targets. WebAssembly, Web Workers, IndexedDB, ES modules, and WebGL 2 must be enabled. Tablets support viewport navigation and light editing; small-screen layouts expose Shape, Inspector, and History panels one at a time.

## Troubleshooting

### The model area is blank

- Confirm WebGL is enabled.
- Update the browser and graphics driver.
- Disable an extension that blocks WebAssembly or workers.
- Reload once; the project remains in IndexedDB.

### Boolean reconstruction reports an error

- Ensure the first selected input is a solid.
- Confirm the hole overlaps the solid.
- Avoid zero or negative dimensions.
- Edit or suppress the failing Boolean feature.

### Offline mode is not available

Service workers require HTTPS, except on `localhost`. Visit the hosted application once while online and allow its files to finish loading.

### A recent project disappeared

Browser cleanup, private browsing, quota eviction, or a different browser profile can remove or isolate IndexedDB. Restore the project from a `.benchcad` export.

### The application is hosted in a subdirectory but assets fail

Copy the *contents* of `prebuilt/` together and do not rename the generated `assets/` directory. The release uses relative URLs and does not require a configured base path.

## Known limitations

- This is a primitive and mesh-oriented modeler, not a full boundary-representation mechanical CAD system.
- Imported mesh files currently create a measured review proxy; tessellated source rendering and local repair are not yet complete.
- The shipped Manifold Boolean worker supports box-like shapes, cylinders, polygonal prisms, spheres, cones, and pyramids. Other visual primitives fall back to box-like Boolean inputs in this release.
- Text is represented by an editable printable proxy rather than font-outline extrusion.
- Direct transform gizmos, box selection, alignment/distribution, pattern, mirror, workplane-on-face, STL/3MF/OBJ/SVG mesh export, and PNG capture are not yet complete.
- No assemblies, mechanical joints, simulation, toolpaths, cloud collaboration, or constrained parametric sketching are included.

The project format and timeline architecture are designed so these capabilities can be added without replacing the authoritative history model.

## Tests

The automated suite covers:

- feature serialization and stable identifiers;
- deterministic rollback and restoration;
- earlier-body snapshots;
- suppression;
- dependency-safe reordering;
- unit conversion;
- schema migration; and
- a deterministic 250-feature reference history.

Run `npm test`.

## Repository map

```text
app/                       Application entry and visual system
components/                Workbench, viewport, and UI primitives
lib/benchcad-model.ts      Project schema, reconstruction, migration, samples
lib/local-store.ts         IndexedDB persistence
workers/geometry.worker.ts Manifold WebAssembly Boolean reconstruction
public/                    Offline manifest, service worker, and icons
tests/                     Deterministic model-history tests
index.html                 Standalone static entry point
standalone-main.tsx        Standalone React bootstrap
vite.standalone.config.ts  Relative-path static build
prebuilt/                  Generated no-build distribution
```

## Dependencies and licenses

- React — MIT
- Three.js — MIT
- Manifold — Apache-2.0
- JSZip — MIT/GPLv3 dual license
- Radix UI / shadcn-derived local primitives — MIT
- Lucide icons — ISC
- Vite — MIT

See the dependency packages for complete notices. BENCHCAD’s original source is provided under the MIT License in `LICENSE`.
