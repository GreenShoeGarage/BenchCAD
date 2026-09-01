# BENCHCAD v0.37.0 — First-Class 2D Sketching

BENCHCAD is a local-first browser CAD workbench combining direct solid modeling, exact numeric control, persistent feature history, manufacturing screening, and associative technical drawings.

Version 0.37.0 repairs the sketch workflow so a sketch can be created on a planar body face or workplane, edited against visible supporting geometry, finished without disappearing, reopened later, and used for additive or subtractive profile features.

## Release identity

| Item | Value |
|---|---|
| Application | **BENCHCAD 0.37.0** |
| Project schema | **10** |
| Drawing schema | **5** |
| Project migration | Local schema-9 to schema-10 migration |
| Runtime backend | None |
| Telemetry | None |
| Geometry kernel | Packaged Manifold WebAssembly |
| Default sketch command | Select |

## Sketch workflow

### Sketch on a body face

1. Switch the selection filter to **Face**.
2. Select exactly one planar face.
3. Choose **Sketch**.
4. Draw against the exact reconstructed supporting body shown beneath the sketch plane.
5. Choose **Finish sketch**.
6. Select the persistent sketch in the viewport or Component Browser and choose **Extrude profiles**.

The sketch stores an associative reference to its support body and face frame. If the face can no longer be resolved after an upstream edit, BENCHCAD reports the support failure instead of inventing a replacement.

### Sketch on a workplane

Activate an origin XY, XZ, or YZ workplane—or an associative custom workplane—and choose **Sketch** without selecting a face. The saved sketch retains that workplane relationship and local coordinate frame.

### Command behavior

- A new sketch opens in **Select** mode.
- Connected line begins only after the command is chosen.
- `Escape` cancels the active chain or transient command and restores Select.
- `Enter` finishes an open connected-line chain.
- **Close profile** explicitly closes a polyline loop.
- **Finish sketch** stores the sketch and any valid pending open line chain.

## Persistent sketch objects

Finished sketches remain available as design inputs:

- visible three-dimensional sketch linework;
- selectable viewport objects;
- Component Browser rows;
- feature-history records;
- Sketch Inspector actions for Edit, Extrude Profiles, and visibility;
- downstream rebuild sources for profile features.

Hiding a sketch changes only its display state. It does not delete the sketch or its profile data.

## Extrusion directions and operations

Closed profiles support:

- **Positive** — along the sketch normal;
- **Negative** — opposite the sketch normal;
- **Symmetric** — total distance divided equally across the sketch plane.

Operations are:

- **New body**;
- **Join target body**;
- **Cut target body**.

A face-supported Join or Cut can automatically target its supporting body. Solid Extrude and Thin Extrude both preserve their direction in feature parameters and reconstruct it during later sketch edits.

## Compatibility

Opening a schema-9 project creates a recovery-safe schema-10 migration:

- existing Extrude and Thin Extrude features receive explicit Positive direction;
- existing sketches receive persistent visibility defaults;
- support-body metadata is retained where available;
- project geometry is not otherwise changed;
- migration is recorded in project history.

Drawing schema 5 is unchanged.

## Static deployment

Extract the static ZIP directly into the directory serving BENCHCAD:

```text
index.html
sw.js
manifest.webmanifest
favicon.svg
assets/
  benchcad-v0.37.0.js
  benchcad-v0.37.0.css
  geometry.worker-*.js
  import.worker-*.js
  manifold-*.wasm
```

All runtime references are relative and support a domain root or nested path such as:

```text
https://example.com/projects/benchcad/
```

For local testing:

```bash
python3 -m http.server 8080
```

Open `http://localhost:8080/`. Direct `file:` loading is not supported because Workers, WebAssembly, IndexedDB, and the Service Worker are most reliable over HTTPS or localhost.

## Updating an existing deployment

1. Replace the old deployment files with the v0.37.0 static archive contents.
2. Hard-refresh the page.
3. Clear the previous BENCHCAD service worker/site cache once if an older build remains visible.
4. Reload while online so `benchcad-v0.37.0-first-class-sketch` can cache the new shell.

## Validation

The release includes:

- **39/39** focused first-class sketch browser checks;
- **11/11** production geometry-worker and packaged Manifold WebAssembly checks;
- **10/10** sketch command-lifecycle checks;
- **29/29** additional two-dimensional browser checks;
- **15/15** sketch model/schema checks;
- **132/132** package and static-deployment checks;
- **6/6** origin-workplane checks;
- schema-9 to schema-10 migration evidence;
- nested `/projects/benchcad/` asset-path and service-worker validation;
- JavaScript, worker, and service-worker syntax checks;
- internal per-file SHA-256 verification;
- ZIP integrity and root-level `index.html` verification.

The focused workflow covers face selection, exact underlay, Select-first startup, Escape reset, profile creation, Finish Sketch persistence, viewport/browser selection, reopen/edit, positive extrusion, negative Cut, and retained source sketches.

## Known boundaries

BENCHCAD remains a mesh-based pre-1.0 CAD system. Sketches support planar faces and planar workplanes, not curved surfaces. The relation solver is not a complete professional geometric constraint system. Exact-mesh Boolean operations can fail on invalid or numerically marginal geometry. Read `KNOWN-LIMITATIONS.md` before fabrication.

Batch 28 — Technical Drawings 2.0 remains complete. Batch 29 — Large-Model Performance remains next on the roadmap.
