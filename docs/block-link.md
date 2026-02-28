# Link Block

The Link block is a special-purpose SVG-based block that lets you draw visual connection lines between elements on your card. Unlike all other blocks, Links are **not available in the Blocks palette** and cannot be dragged onto the canvas. Instead, they are created through a dedicated toggle in the header bar.

Links are ideal for building energy flow diagrams, system topology visualizations, or any card that needs to show connections between entities — such as power flowing from solar panels to batteries to home consumption.

<!-- screenshot: block-link-overview — A card showing two or three blocks connected by link lines with animated particles flowing along the paths, demonstrating an energy flow visualization -->

## Creating a Link

To create a new Link:

1. Click the **Link toggle** button in the right section of the **Header Bar** (alongside the other toggle buttons)
2. The builder enters **Draw mode** — the canvas is overlaid with the link editor
3. **Click** on the canvas to place points that define the link path
4. **Right-click** or click **Finish Path** in the Link Editor overlay to complete the path

Each click adds a new point. You need at least **two points** to form a valid link.

<!-- screenshot: block-link-draw-mode — The canvas in link draw mode showing a partially drawn path with several points placed and a preview line following the cursor -->

> **Tip:** You can create multiple Link blocks in the same card — each one is independent and has its own path, entity binding, and animation settings.

---

## Link Editor

When a Link block is selected and in editing mode, the **Link Editor overlay** appears in the right sidebar. This overlay provides full control over the link's geometry, segments, smoothing, and grid/snap preferences.

<!-- screenshot: link-editor-overlay — The Link Editor overlay panel showing the Mode section, Points list, Segment editor, Smoothing controls, and Grid & Snap options -->

### Editor Modes

The Link Editor operates in three modes:

| Mode | Description |
|------|-------------|
| **Draw** | Place new points by clicking on the canvas. A preview line follows the cursor. Right-click or click "Finish Path" to complete. |
| **Edit** | Modify existing points and segments. Drag points, adjust handles, and configure properties. |
| **Pick Anchor** | Click a block on the canvas to anchor the currently selected point to that block. |

### Opening the Editor

Select the Link block and click **Edit Link** in its [Properties panel](#properties)

---

## Points

Points define the geometry of the link path. Each point is a position on the canvas expressed in **normalized percentage coordinates** (0–100 on both axes), making links resolution-independent and responsive.

The **Points** section of the Link Editor lists all points. Click on a point to select it and reveal its editing controls.

<!-- screenshot: link-editor-points — The Points section of the Link Editor showing a list of points (P1, P2, P3) with one selected and its coordinate inputs visible -->

### Point Editing

When a point is selected:

| Control | Description |
|---------|-------------|
| **X / Y** | Numeric coordinate inputs (0–100 %), adjustable in 0.1% steps |
| **Anchor To Block** | Toggle to anchor this point to another block on the canvas |
| **Delete Point** | Remove the point (available when more than 2 points exist) |

### Dragging Points

In **Edit mode**, points are displayed as circles on the canvas. You can:

- **Drag a point** to move it to a new position
- **Right-click on the path** between two points to insert a new point at that location
- **Drag the entire path** to shift all points at once

### Anchor Points

A powerful feature of the Link block is the ability to **anchor** a point to another block. When a point is anchored:

- The point automatically follows the position of the target block
- If the target block is moved, the link endpoint moves with it
- You can configure the **anchor position** on the target block (9 positions: Top-Left, Top-Center, Top-Right, Middle-Left, Center, Middle-Right, Bottom-Left, Bottom-Center, Bottom-Right)
- An **offset** (X/Y in %) can be applied relative to the anchor position

<!-- screenshot: link-anchor-point — A point anchored to a block element, showing the anchor chip with the block name, the anchor position selector, and offset controls -->

#### Anchoring a Point

1. Select a point in the Points list
2. Enable **Anchor To Block**
3. The editor enters **Pick Anchor** mode — click any block on the canvas
4. The point snaps to the selected block's center
5. Adjust the **Anchor Point** position and **Offset** as needed

#### Changing or Removing an Anchor

- Click **Change Block** to pick a different target block
- Disable the **Anchor To Block** toggle to detach the point — it retains its current position but is no longer linked to the block

---

## Segments

Segments are the connections **between** consecutive points. Each segment can be independently configured as a **Line** or a **Curve**.

The **Segments** section lists all segments (S1, S2, …). Click on a segment to select it and see its options.

| Setting | Description |
|---------|-------------|
| **Type** | `Line` (straight) or `Curve` (Bézier) |

### Curve Segments

When a segment is set to **Curve**, additional options become available:

| Setting | Description |
|---------|-------------|
| **Curve Preset** | Pre-configured handle arrangements: **Smooth** (no tension, auto-smooth), **Arc** (bulge-based), **Symmetric** (mirrored handles), or **Manual** (full control) |
| **Bulge** | Controls the curve intensity for Arc and Symmetric presets (−1 to +1) |
| **Update on Move** | When enabled, curve handles are automatically recalculated when points are moved. Handles remain manually editable regardless. |

In **Edit mode**, curve segments display **control handles** on the canvas — small circles connected by lines to their parent points. Drag the handles to shape the curve.

<!-- screenshot: link-curve-segment — A curved link segment with visible control handles (in/out) connected to the points by thin lines, demonstrating a Bézier curve between two blocks -->

---

## Smoothing

The **Smoothing** section provides a global path smoothing option that affects all **line segments** (curves are unaffected since they already have explicit handles).

| Setting | Description |
|---------|-------------|
| **Smoothing** | Enable/disable Catmull-Rom-style smoothing on line segments |
| **Tension** | Controls the smoothing intensity (0 = maximum smoothing, 1 = no smoothing). Default: 0.15 |

When smoothing is enabled, straight line segments are automatically converted to smooth curves based on the positions of neighboring points. This is useful for creating organic, flowing paths without manually adjusting curve handles on every segment.

---

## Grid & Snap

The Link Editor provides tools to help you position points precisely:

| Setting | Description |
|---------|-------------|
| **Show Points** | Show/hide the editable point and handle circles on the canvas |
| **Show Grid** | Display a percentage-based grid overlay on the link's canvas area |
| **Grid Color** | Customize the grid line color |
| **Snap to Grid** | When enabled, points snap to the nearest grid intersection while dragging (5% steps) |
| **Snap to Points** | When enabled, points snap to align with other existing points (shows alignment guides) |
| **Snap to Blocks** | When enabled, points snap to the edges and centers of other blocks on the canvas |

<!-- screenshot: link-grid-snap — The link editor with grid enabled and a point being dragged, showing snap guides aligning with another point -->

---

## Properties

The Link block's Properties panel (right sidebar) exposes the following configuration groups when the block is selected:

### Link Editor

| Property | Description |
|----------|-------------|
| **Edit Link** | Opens the Link Editor overlay for geometry editing |

### Rendering

| Property | Description |
|----------|-------------|
| **Style** | Animation style used for the link. Currently available: **Particle** |

### Particle Animation Properties

When the **Particle** style is selected:

| Property | Description |
|----------|-------------|
| **Particle Size** | Size of the animated particle in pixels (1–48). Overrides the default size when set. |

### Flow

The flow settings control the animation behavior along the path:

| Property | Description |
|----------|-------------|
| **Enable Animation** | Toggle the flow animation on/off |
| **Positive Direction** | Direction of flow when the entity value is positive: **Start → End** or **End → Start** |
| **Speed Preset** | How entity value maps to animation speed: **Linear** (`|value|`), **Slow** (`|value| / 3`), **Fast** (`|value| × 2`), or **Custom** |
| **Custom Formula** | Jinja2 template for custom speed calculation (when Speed Preset is Custom). Available keywords: `{{ value }}`, `{{ state }}`, `{{ entity_id }}`. Example: `{{ (value | abs) * 1.5 }}` |
| **Value Source** | Where to read the speed value from: **Entity State** or a specific **Attribute** |
| **Attribute** | (When Value Source is Attribute) The attribute name to read the value from |

#### How Flow Animation Works

The link's animation is driven by the bound entity's numeric value:

- The **magnitude** (absolute value) of the entity state determines the **speed** of the animation
- The **sign** (positive or negative) determines the **direction** — positive values follow the configured positive direction, negative values go the opposite way
- When the value is **0**, the animation pauses
- The animation speed is proportional to the entity value divided by the path length, so longer paths maintain a consistent visual speed

> **Entity Binding:** The Link block requires an entity. The entity provides the numeric value that drives the animation. A typical use case is binding to a power sensor (e.g., `sensor.solar_power`) — the power value controls how fast and in which direction particles flow along the link.

### Entity Configuration

Like all blocks, the Link block supports all [entity configuration modes](panel-properties.md#entity-configuration): **Inherited**, **Slot**, or **Fixed**.

---

## Style Targets

The Link block exposes these style targets:

| Target | Description |
|--------|-------------|
| **Block** | The link container — limited to visibility (`show`) and `z-index` |
| **Path** | The base SVG path line — supports SVG stroke/fill properties, opacity, and filter effects |
| **Particle** | The animated particle element — supports SVG fill/stroke, opacity, and filter effects |

Style targets let you customize the visual appearance of the link independently. For example, you can make the path line semi-transparent while giving the particle a vibrant color with a glow filter.


---

## Use Case: Energy Flow Diagram

A typical use case for the Link block is building an **energy flow dashboard** that visualizes how power moves through your home:

1. **Create layout blocks** — Place blocks for Solar, Battery, Grid, and Home
2. **Add entity blocks** inside each — Show power values, state icons, etc.
3. **Create Links** — Draw connections between Solar → Home, Solar → Battery, Grid → Home, etc.
4. **Bind entities** — Assign each link to the appropriate power sensor (e.g., `sensor.solar_to_home_power`)
5. **Configure flow** — Set positive direction so particles flow from source to destination
6. **Style the paths** — Use different colors, widths, or particle styles for each link

The result is a dynamic visualization where particles flow in real time based on actual power readings — speeding up, slowing down, or reversing direction as energy production and consumption change.

<!-- screenshot: block-link-energy-flow — A complete energy flow card showing Solar, Battery, Grid and Home blocks connected by animated links with particles flowing based on real power sensor values -->

---

**Next:** [Layers Panel →](panel-layers.md)


