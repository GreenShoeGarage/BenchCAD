# BENCHCAD v0.37.0 Package Contents

The release is distributed in two archives.

## Static deployment archive

`BENCHCAD-v0.37.0-static.zip` contains only the files required to run BENCHCAD from an ordinary static web directory:

```text
index.html
sw.js
manifest.webmanifest
VERSION.txt
SHA256SUMS.txt
favicon.svg
file.svg
globe.svg
window.svg
assets/
  benchcad-v0.37.0.js
  benchcad-v0.37.0.css
  geometry.worker-*.js
  geometry.worker-*.js.map
  import.worker-*.js
  import.worker-*.js.map
  manifold-*.wasm
```

`index.html` is directly at the ZIP root. No enclosing release directory, backend, package installation, compilation, or command-line build is required for deployment.

## Complete GitHub and release archive

`BENCHCAD-v0.37.0-complete.zip` contains the static runtime plus:

- `README.md`
- `RELEASE-README.md`
- `RELEASE-NOTES.md`
- `KNOWN-LIMITATIONS.md`
- `PACKAGE-CONTENTS.md`
- current and retained validation reports
- model, drawing, lighting, shell, and sketch screenshots under `docs/images/`
- internal per-file `SHA256SUMS.txt`

## Current v0.37.0 validation evidence

| File | Purpose |
|---|---|
| `V0.37.0-SKETCH-WORKFLOW-TESTS.json` | Primary 39-check face/workplane sketch workflow |
| `V0.37.0-ACTUAL-WORKER-TESTS.json` | 11-check production geometry-worker and Manifold qualification |
| `V0.37.0-SKETCH-COMMAND-LIFECYCLE-TESTS.json` | Pending chain, Finish Sketch, open-chain persistence, and reopen behavior |
| `V0.37.0-SKETCH-2D-BROWSER-TESTS.json` | Additional 29-check sketch browser suite |
| `V0.37.0-SKETCH-MODEL-TESTS.json` | 15 model, face-frame, round-trip, and migration checks |
| `V0.37.0-WORKPLANE-SKETCH-TESTS.json` | Origin-workplane startup and cancel behavior |
| `V0.37.0-SCHEMA-MIGRATION-TEST.json` | Schema-9 to schema-10 migration |
| `V0.37.0-PACKAGE-TESTS.json` | Static/runtime/package release gate |
| `V0.37.0-BUILD-REPORT.json` | Build identity and aggregate validation summary |

## Representative sketch screenshots

- `docs/images/benchcad-sketch-face-underlay.png`
- `docs/images/benchcad-sketch-negative-cut.png`
- `docs/images/benchcad-sketch-persistent.png`
- `docs/images/benchcad-sketch-workplane.png`
- `docs/images/benchcad-sketch-real-worker-cut.png`

The complete package remains a prebuilt static distribution rather than the original TypeScript source checkout.
