# BENCHCAD v0.36.1 Complete Package

This archive combines the prebuilt BENCHCAD v0.36.1 static application, GitHub documentation, viewport screenshots, and release-validation evidence.

## Deployable runtime

Copy `index.html`, `sw.js`, `manifest.webmanifest`, the SVG icons, and the complete `assets/` directory into a static web directory. The runtime works at a domain root or a subdirectory such as `/projects/benchcad/`. No backend, account, compilation step, or runtime network dependency is required after the application shell has been cached.

## Documentation

- `README.md` — GitHub repository front page and complete user/deployment overview.
- `RELEASE-README.md` — focused v0.36.1 viewport-rendering release guide.
- `RELEASE-NOTES.md` — cumulative release history.
- `KNOWN-LIMITATIONS.md` — current technical and product limitations.
- `docs/images/` — local screenshots referenced by the README.

## Validation evidence

- `VIEWPORT-RENDERING-TESTS.json` and `.txt` — real WebGL/Manifold shell-rendering and responsive-control checks.
- `V0.36.1-PACKAGE-TESTS.json` and `.txt` — current release identity, schema, syntax, service-worker, nested-hosting, screenshot, and runtime-asset checks.
- `UIUX-CONSOLIDATION-TESTS.*` — retained v0.36.0 workspace cleanup checks.
- `V0.36.0-DRAWING-REGRESSION.json` — retained Technical Drawings 2.0 regression checks.
- `BATCH28D-TESTS.*` — retained Detail-view and output checks.
- `ACTUAL-WORKER-TESTS.json` — retained production-worker evidence.
- `STATIC-PACKAGE-TESTS.json` — retained v0.36.0 static-hosting evidence.

`SHA256SUMS.txt` covers every file inside this extracted package except the checksum list itself.
