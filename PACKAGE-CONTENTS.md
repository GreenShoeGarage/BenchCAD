# BENCHCAD v0.36.3 Package Contents

This archive combines the deployable BENCHCAD v0.36.3 application, GitHub-facing documentation, representative viewport images, and release-validation evidence.

## Deployable runtime

Copy these items together into a static web directory:

- `index.html`
- `sw.js`
- `manifest.webmanifest`
- the SVG icons
- the complete `assets/` directory

The runtime supports a domain root or nested path such as `/projects/benchcad/`. No backend, account, compilation step, or runtime telemetry service is required. After the shell is cached, the Service Worker can reopen it offline.

## Documentation

- `README.md` — repository front page, capabilities, use, deployment, integrity, limitations, and roadmap.
- `RELEASE-README.md` — focused v0.36.3 lighting-preset guide.
- `RELEASE-NOTES.md` — cumulative release history.
- `KNOWN-LIMITATIONS.md` — current product and technical limitations.
- `docs/images/` — current model, drawing, lighting, shell-inspection, and mobile screenshots.

## Current validation evidence

- `V0.36.3-LIGHTING-PRESETS-TESTS.json` and `.txt` — 55 browser checks across desktop, Presentation, high-DPR Performance, mobile, reset, shortcut, persistence, and Drawing smoke scenarios.
- `V0.36.3-PACKAGE-TESTS.json` and `.txt` — release identity, schemas, syntax, icon exports, WebAssembly, runtime assets, relative paths, service-worker cache, documentation, screenshots, checksums, and ZIP structure.
- `V0.36.3-BUILD-REPORT.json` — static-bundle size and release summary.
- `V0.36.2-INTERIOR-VISIBILITY-TESTS.json` — retained production geometry-worker and Manifold shell evidence for the unchanged geometry path.
- `V0.36.2-DRAWING-REGRESSION.json` — retained Technical Drawings 2.0 regression evidence.
- `SHA256SUMS.txt` — checksum coverage for every file inside the package except the checksum list itself.

## Representative screenshots

- `docs/images/benchcad-model-workspace.png`
- `docs/images/benchcad-drawing-workspace.png`
- `docs/images/benchcad-lighting-presets.png`
- `docs/images/benchcad-lighting-workbench.png`
- `docs/images/benchcad-lighting-flat.png`
- `docs/images/benchcad-lighting-technical.png`
- `docs/images/benchcad-lighting-mobile.png`
- `docs/images/benchcad-shell-shaded-edges.png`
- `docs/images/benchcad-shell-interior.png`
- `docs/images/benchcad-shell-xray.png`

The static and complete ZIP files have no extra enclosing directory. `index.html` is directly at the archive root.
