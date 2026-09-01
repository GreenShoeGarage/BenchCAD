# BENCHCAD v0.36.3 — Modeling-First Lighting Presets

BENCHCAD is a local-first browser CAD workbench combining direct solid modeling, exact numeric control, editable feature history, manufacturing screening, and associative technical drawings.

Version 0.36.3 separates viewport **display style** from viewport **lighting**. The default is now explicitly modeling-first: **Shaded + edges + Workbench**. Users can reduce shading drama for precision work or select a richer presentation look without changing model geometry.

## Release identity

| Item | Value |
|---|---|
| Application | **BENCHCAD 0.36.3** |
| Project schema | **9** |
| Drawing schema | **5** |
| Project migration | None |
| Default display style | Shaded + edges |
| Default lighting | Workbench |
| Runtime backend | None |
| Telemetry | None |
| Geometry kernel | Packaged Manifold WebAssembly |

## Lighting presets

Open the **sparkles** menu beside the viewport eye menu.

### Workbench

The default modeling light. It uses neutral matte surfaces, balanced key/fill light, restrained highlights, and a soft contact shadow. It is designed to keep faces, internal edges, split boundaries, and shell cavities readable during ordinary work.

### Flat / CAD

Uses diffuse Lambert materials with no real-time cast shadows or specular gloss. Choose this when surface reflections interfere with face selection, alignment, shell inspection, or long modeling sessions.

### Technical

Uses cool neutral light, high roughness, and restrained face contrast so technical edge overlays remain dominant.

### Presentation

Uses a warmer key/rim balance, lower roughness, and richer highlights for screenshots and design reviews. It remains lighter than the previous glossy renderer and avoids the expensive clearcoat path.

### Performance

Uses simplified diffuse lighting, disables cast shadows, and caps the renderer pixel ratio at 1.25. On the validated DPR-2 fixture, the backing buffer fell from 1392 × 1008 to 870 × 630 without changing the CSS viewport size.

## Independent display and lighting layers

The existing eye menu still controls geometry presentation:

- Shaded + edges
- Shaded
- Technical
- Interior inspect
- X-ray inspect
- Wireframe

Lighting is independent. For example:

- **Shaded + edges + Flat / CAD** for precision modeling
- **Interior inspect + Workbench** for hollow parts
- **Technical + Technical** for diagram-like inspection
- **Shaded + Presentation** for screenshots

Use **Shift+L** to cycle lighting presets. The shortcut works when a toolbar or menu button retains focus, but it does not intercept text entry. **Reset view style and lighting** returns to Shaded + edges and Workbench.

## Data integrity and compatibility

Lighting and display selections are browser-local interface preferences. They do not:

- create feature-timeline entries;
- modify project geometry;
- change project or drawing schemas;
- dirty the project;
- affect manufacturing analysis;
- alter STL, OBJ, 3MF, SVG, DXF, or PDF output.

Existing schema-9 projects open without migration.

## Static deployment

Extract the static ZIP directly into the directory serving BENCHCAD:

```text
index.html
sw.js
manifest.webmanifest
favicon.svg
assets/
  benchcad-v0.36.3.js
  benchcad-v0.36.3.css
  geometry.worker-*.js
  import.worker-*.js
  manifold-*.wasm
```

All runtime references are relative and support a domain root or a nested path such as:

```text
https://example.com/projects/benchcad/
```

For local testing:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080/`. Direct `file:` loading is not supported because Workers, WebAssembly, IndexedDB, and the Service Worker are most reliable over HTTPS or localhost.

## Updating an existing deployment

1. Replace the previous BENCHCAD files with the v0.36.3 static archive contents.
2. Hard-refresh the page.
3. Clear the old BENCHCAD service worker/site cache once if v0.36.2 remains visible.
4. Reload while online so the new shell can be cached.

The current cache name is:

```text
benchcad-v0.36.3-lighting-presets
```

## Validation evidence

`V0.36.3-LIGHTING-PRESETS-TESTS.json` records **55/55 passing checks** across:

- the default Workbench state;
- menu access and all five options;
- Flat/CAD selection;
- Shift+L cycling from toolbar focus;
- reset behavior;
- browser-local preference storage;
- distinct Workbench, Flat/CAD, and Technical WebGL frames;
- direct Presentation selection and responsiveness;
- high-DPR Performance buffer reduction;
- 390-pixel mobile access;
- Technical Drawings workspace smoke testing;
- page and console cleanliness.

The focused browser suite uses a deterministic Worker adapter to isolate UI and WebGL behavior. The production geometry worker and Manifold WebAssembly assets are unchanged from v0.36.2 and are covered by retained real-worker evidence plus the current package syntax and asset gates.

## Known limitations

- Lighting presets are practical viewport aids, not calibrated photometric or physically measured illumination.
- BENCHCAD does not include ray tracing, path tracing, environment-map authoring, material textures, or a studio-rendering pipeline.
- Presentation is intentionally restrained; it is not intended to replace a dedicated renderer.
- Performance lowers viewport pixel density on high-DPR screens, so linework may appear slightly softer.
- Real-time transparent Interior and X-ray modes can exhibit ordinary depth-sorting artifacts.

Read `KNOWN-LIMITATIONS.md` before fabrication use.

## Roadmap position

Batch 28 — Technical Drawings 2.0 remains complete. Version 0.36.3 is a focused maintenance release before **Batch 29 — Large-Model Performance**.
