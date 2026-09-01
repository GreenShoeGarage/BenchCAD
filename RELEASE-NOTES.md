# BENCHCAD v0.31.0 release notes

## Batch 27

This release combines a project-level parametric-control layer with manufacturing-readiness, DXF, and fabrication-oriented workflows.

### Named parameters

- Safe named expressions with dependency and cycle validation.
- Unit literals and common mathematical functions.
- Dimension, position, and rotation bindings.
- Automatic downstream value rebuild.
- Direct numeric edits detach only the edited binding.
- Project schema advanced to version 5 with schema-v4 migration.

### Manufacturing readiness

- Dedicated Manufacture command.
- Visible-body and selection analysis scopes.
- Configurable process thresholds.
- Mesh integrity, thin-wall, small-feature, overhang, draft, and possible-interference findings.
- JSON and HTML report export.
- Mesh-export preflight integration.

### DXF

- ASCII DXF import as editable sketches.
- LINE, POLYLINE, LWPOLYLINE, CIRCLE, ARC, and POINT support.
- Unit-aware profile, sketch, and drawing-sheet DXF export.

### Fabrication features

- Thin Extrude.
- Rib / Web.
- Cosmetic and represented thread annotations.
- Honest exclusion of represented thread annotation geometry from mesh export.

### Deliberate deferral

STEP export remains deferred until BENCHCAD has a trustworthy analytic boundary-representation geometry model and persistent topology naming.
