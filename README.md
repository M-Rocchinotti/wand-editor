# WallStudio

A single-file browser-based tool for designing wall elevations and room layouts in millimetres. No installation, no build step — open `wall-designer-pro.html` in any modern browser and start designing.

![WallStudio dark mode](https://raw.githubusercontent.com/M-Rocchinotti/wand-editor/master/preview.png)

---

## Features

- **3D isometric preview** — real-time orbital camera, zoom, and pan
- **Wall elevation view** — place furniture, fixtures, windows, doors, artwork, and more on a wall face
- **Floor plan view** — top-down 2D view with full dimensions and material legend
- **Wall elevation 2D view** — front-on elevation with annotated measurements
- **Multi-page rooms** — add pages to model layered walls (baseboards, first fix, second fix, etc.)
- **Snap to objects** — hold Ctrl while dragging or toggle the magnet button to snap to edges of nearby objects
- **Auto-snap ghost** — placement preview snaps to object edges automatically
- **Import 3D models** — drag-and-drop or load OBJ, STL, GLB, PLY files into the scene
- **Textures** — apply PNG/JPG textures to any placed object
- **Material list / BOM** — auto-generated bill of materials per page and across all pages
- **PDF export** — dimensioned floor plan and wall elevation exported as a multi-page PDF
- **Save / load** — `.wallstudio` JSON files; scenes with 3D meshes save as `.wallstudio.zip`
- **Shareable URL** — share a full scene via a base64-encoded URL fragment (no server needed)
- **Undo / redo** — 60-level history
- **7 languages** — English, German, Spanish, Italian, Russian, Chinese, French
- **Light / dark mode** — toggle with the ☾ / ☀ button, applied to all views including 2D plan

---

## Quick Start

1. Download or clone this repository
2. Open `wall-designer-pro.html` in Chrome, Firefox, Edge, or Safari
3. Set your wall dimensions in the **Wall** section of the left panel
4. Click an element in the palette to start placing it — a ghost preview follows your cursor
5. Click on the canvas to place the element; right-click or press Escape to cancel
6. Click placed objects to select them; drag to reposition
7. Press **⊞ Plan** to open the 2D floor plan / wall elevation overlay
8. Use **Save** to export your scene, **PDF** to export dimensioned drawings

---

## Interface Overview

```
┌─────────────────────────────────────────────────────────────────┐
│ Left panel                     │  Main 3D viewport              │
│                                │                                 │
│  Wall settings (W × H × D)     │  Orbital 3D view               │
│  Wall colour swatches          │                                 │
│  Light source controls         │  [⊞ Plan] button → 2D overlay  │
│  Element palette (categories)  │                                 │
│  Selected-object editor        │  Page tabs + navigation dots   │
│  Object list                   │                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Left panel sections

| Section | Purpose |
|---|---|
| **Wall** | Set width, height, depth of the wall in mm; choose face / side / floor colours |
| **Light source** | Enable a movable point light and set intensity |
| **Elements** | Palette of placeable objects grouped by category |
| **Edit** | Appears when an object is selected — resize, recolour, rename, apply texture, lock/delete |
| **Objects** | Scrollable list of all placed objects on the current page |

---

## Placing Elements

1. Click an element chip in the palette — the chip highlights and your cursor becomes a crosshair
2. Move over the 3D viewport; a semi-transparent **ghost** shows where the object will land
3. The ghost auto-snaps to edges of existing objects for precise alignment
4. Hold **Ctrl** while hovering to manually engage snap-to-objects
5. Click to place — the element appears and placement mode stays active so you can place more
6. Right-click or press **Escape** to exit placement mode
7. Click the same chip again to toggle placement off

### Wall vs floor objects

- **Wall objects** (shelves, frames, windows, doors …) are placed on the wall face. The Y axis is height from floor.
- **Floor objects** (sofas, tables, chairs …) are placed on the floor. The depth axis (`rd`) is distance from the wall.

---

## Camera Controls (3D Viewport)

| Action | Control |
|---|---|
| Orbit | Right-click drag |
| Pan | Middle-click drag |
| Zoom | Scroll wheel |
| Place object | Left-click (while in placement mode) |
| Select object | Left-click |
| Multi-select | Shift + left-click |
| Select all | Ctrl+A |
| Deselect / cancel | Escape |

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| Escape | Cancel placement / deselect |
| Delete / Backspace | Delete selected object(s) |
| Ctrl+Z | Undo |
| Ctrl+Y or Ctrl+Shift+Z | Redo |
| Ctrl+C | Copy selected object |
| Ctrl+V | Paste object |
| Ctrl+D | Duplicate selected object |
| Ctrl+A | Select all objects on page |
| Arrow Up / Page Up | Go to previous page |
| Arrow Down / Page Down | Go to next page |
| Ctrl (hold, while dragging) | Enable snap-to-objects |

---

## 2D Plan View

Press **⊞ Plan** (or the equivalent button) to open the 2D overlay. Two modes are available:

### Floor plan (top-down)
- Shows the floor area from above
- Displays all floor objects with colour fills
- Annotates every object: width, distance from wall, distance from left/right edges
- Includes overall wall dimensions, wall-thickness band, and a material legend
- Ghost outline shows the previous page's objects for layer-by-layer alignment

### Wall elevation (front-on)
- Shows the wall face straight-on
- Annotates every wall object with coloured dimension lines
- Horizontal dims above/below the wall; vertical dims left/right
- Includes a calibrated ruler on left and bottom axes
- Depth badge on each object shows how far it protrudes from the wall (mm)

**In the 2D view:**
- Scroll to zoom
- Drag to pan
- You can still place objects while the 2D view is open
- Right-click to cancel placement

---

## Multi-page Rooms

Use pages to model a wall across multiple layers (e.g. Page 1 = structural frame, Page 2 = insulation, Page 3 = finish layer). Each page:
- Has its own object list
- Inherits the `baseWZ` offset from the previous page (so objects stack in depth correctly)
- Shows the previous page's objects as ghost outlines in the 2D view for alignment

**Page controls:**
- **+** button → add a new page
- Click a tab to switch pages
- Double-click a tab to rename
- Arrow keys / Page Up/Down to navigate

---

## Snap System

Two snap modes work together:

| Mode | How to activate | Effect |
|---|---|---|
| **Auto-snap ghost** | Always on during placement | Ghost preview snaps to the nearest object edge as you hover |
| **Snap-to-objects (drag)** | Hold Ctrl while dragging, or click the magnet button | Dragged objects snap to edges of all other objects |

Both modes detect left, right, top, and bottom edges and snap within a configurable pixel threshold.

---

## Import 3D Models

1. Click the **Import model** button (or drag a file onto the viewport)
2. Supported formats: **OBJ**, **STL** (binary + ASCII), **GLB/GLTF**, **PLY**
3. In the import dialog:
   - Set the label and dimensions (W × H × D mm)
   - Choose **Floor** or **Wall** placement
   - Optionally load a PNG texture
   - Choose a fallback colour
4. Click **Add to scene** — the model appears in the palette and is ready to place
5. Scenes containing 3D models save as `.wallstudio.zip`

---

## Save, Load, Export

| Action | Button / Shortcut | Format |
|---|---|---|
| Save scene | **Save** | `.wallstudio` (JSON) or `.wallstudio.zip` (with meshes) |
| Load scene | **Load** | Same formats |
| Share via URL | **Share** | Copies URL with base64 scene fragment to clipboard |
| Export PDF | **PDF** | Multi-page PDF: material list + wall elevation + floor plan per page |

### File format versions
- `v:6` — standard JSON (no meshes)
- `v:7` — base64 JSON (shareable URL fragment)
- ZIP wrapper — used when the scene contains imported 3D meshes

---

## Wall & Colour Settings

- **Width (mm)** — total wall length (default 3000 mm)
- **Height (mm)** — wall height (default 2700 mm)
- **Depth (mm)** — wall thickness, visible in 3D and floor plan (default 200 mm)
- **Wall colour** — face colour; also used for the wall-thickness band in the floor plan
- **Side colour** — visible side faces in 3D
- **Floor colour** — floor quad colour in 3D

---

## Element Categories

| Category | Placement | Examples |
|---|---|---|
| Wall furniture | Wall face | Shelf, picture frame, TV, clock, painting, mirror |
| Wall structural | Wall face | Window, door, switch, outlet, tile panel, ventilation |
| Floor furniture | Floor | Sofa, armchair, coffee table, dining table, chair, bed |
| Floor structural | Floor | Column, radiator, stairs |
| Lighting | Wall face | Point light source (movable via drag in 3D) |
| Custom (imported) | Wall or Floor | Any OBJ / STL / GLB / PLY model |

---

## Tutorial: Design a Living Room Wall

### 1 — Set up the wall

In the left panel under **Wall**, set:
- Width: `4200` mm
- Height: `2700` mm
- Depth: `200` mm

Choose a light wall colour for the face.

### 2 — Add a window

In the palette, find **Window** under *Wall structural*. Click it to start placement. Move your cursor to roughly the centre of the wall at about 900 mm from the floor and click to place. Select the placed window and in the **Edit** panel adjust:
- W: `1200` mm
- H: `1400` mm
- Y (height from floor): `900` mm

### 3 — Add shelves

Select **Shelf** from the palette. Place two shelves flanking the window. Hold **Ctrl** while placing the second to snap it to the same height as the first.

### 4 — Add a sofa

Switch to the floor objects. Select **Sofa** and click in the floor area. The sofa appears from above in the floor plan (open it with **⊞ Plan**). Drag it to the desired distance from the wall.

### 5 — Open the 2D plan

Press **⊞ Plan** and click **Wall Elevation**. You will see all placed objects with dimension annotations. Adjust positions in the 3D view and the plan updates live.

### 6 — Export

Press **PDF** to export a dimensioned drawing package. The PDF contains a material list, wall elevation, and floor plan for every page in your design.

---

## Architecture Notes

`wall-designer-pro.html` is a single self-contained file (~2 200 lines). There is no build step. Two CDN scripts are loaded at runtime:
- `jszip 3.10.1` — ZIP save/load for scenes with meshes
- `jspdf 2.5.1` — PDF export

See `CLAUDE.md` for the full technical architecture reference (global state, coordinate system, render pipeline, etc.).

---

## Browser Compatibility

Tested in Chrome 120+, Firefox 121+, Edge 120+, Safari 17+. Requires Canvas 2D API and ES2020.

---

## License

MIT
