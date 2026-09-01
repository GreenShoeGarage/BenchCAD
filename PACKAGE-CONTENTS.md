# BENCHCAD v0.36.2 Package Contents

This archive combines the deployable BENCHCAD v0.36.2 application, GitHub-facing documentation, representative screenshots, and release-validation evidence.

## Deployable runtime

Copy these items together into a static web directory:

- `index.html`
- `sw.js`
- `manifest.webmanifest`
- the SVG icons
- the complete `assets/` directory

The runtime supports a domain root or a nested path such as `/projects/benchcad/`. No backend, account, compilation step, or runtime telemetry service is required. After the application shell has been cached, the Service Worker can reopen it offline.

## Documentation

- `README.md` — repository front page, capabilities, use, deployment, data integrity, and roadmap.
- `RELEASE-README.md` — focused v0.36.2 shell-interior visibility guide.
- `RELEASE-NOTES.md` — cumulative release history.
- `KNOWN-LIMITATIONS.md` — current product and technical limitations.
- `docs/images/` — current model, shell-inspection, X-ray, and drawing screenshots referenced by the documentation.

## Current validation evidence

- `V0.36.2-INTERIOR-VISIBILITY-TESTS.json` and `.txt` — 30 focused browser checks using the production Three.js application, real geometry worker, and packaged Manifold WebAssembly kernel.
- `V0.36.2-DRAWING-REGRESSION.json` — 28 retained Technical Drawings 2.0 checks with valid SVG/DXF/PDF output and matching primitive signatures.
- `V0.36.2-PACKAGE-TESTS.json` and `.txt` — release identity, schemas, syntax, WebAssembly, runtime assets, relative paths, service-worker cache, documentation, screenshots, checksums, and ZIP structure.
- `V0.36.2-BUILD-REPORT.json` — 210 transformed modules, 5,515,528-byte bundle, and no compatibility stubs.
- `SHA256SUMS.txt` — checksum coverage for every file inside the package except the checksum list itself.

Older UI, drawing, worker, and Batch 28 reports are retained as historical regression evidence; the `V0.36.2-*` reports are authoritative for this maintenance release.

## Representative screenshots

- `docs/images/benchcad-model-workspace.png`
- `docs/images/benchcad-drawing-workspace.png`
- `docs/images/benchcad-shell-shaded-edges.png`
- `docs/images/benchcad-shell-interior.png`
- `docs/images/benchcad-shell-xray.png`

The package has no extra enclosing directory. `index.html` is directly at the ZIP root.
