# Builder Overview

The builder is Card Builder's full-screen visual editor where you design your cards. It is organized into a central **canvas** with a **left sidebar**, a **right sidebar**, and a **header bar** with global controls.

<!-- screenshot: builder-full-layout — The entire builder interface annotated with labels: left sidebar, canvas, right sidebar, and header bar -->

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│                         Header Bar                              │
│  [Entities] [Actions]    [Container Selector]       [Toggles]    │
├────────────┬────────────────────────────────┬───────────────────┤
│            │                                │                   │
│   Left     │                                │      Right        │
│  Sidebar   │          Canvas                │     Sidebar       │
│            │                                │                   │
│  ┌──────┐  │                                │  ┌─────────────┐  │
│  │Blocks│  │                                │  │ Properties  │  │
│  │------│  │                                │  │ ----------  │  │
│  │Layers│  │                                │  │ Styles      │  │
│  └──────┘  │                                │  │ ----------  │  │
│            │                                │  │ Actions     │  │
│            │                                │  └─────────────┘  │
├────────────┴────────────────────────────────┴───────────────────┘
```

### Left Sidebar

The left sidebar contains two tabs:

- **Blocks** — The block palette. Drag blocks from here into the canvas. See [Blocks Reference](panel-blocks.md).
- **Layers** — The layer tree showing the hierarchy of all blocks in the canvas. See [Layers Panel](panel-layers.md).

### Right Sidebar

The right sidebar contains three tabs:

- **Properties** — Configure the selected block's data and behavior. See [Properties Panel](panel-properties.md).
- **Styles** — Control the visual appearance of the selected block. See [Styles Panel](panel-styles.md).
- **Actions** — Assign interactive actions to the selected block. See [Actions Panel](panel-actions.md).

### Canvas

The central area is the **canvas** — a live preview of your card. This is where you:

- **Drop blocks** from the palette
- **Select blocks** by clicking on them
- **Move absolute blocks** by dragging them to a new position
- **Resize blocks** using resize handles on selected absolute blocks
- **See a live preview** of your card with real entity data

<!-- screenshot: builder-canvas-with-blocks — The canvas showing several blocks arranged, one selected with resize handles and the contextual toolbar visible -->

#### Contextual Block Toolbar

When a block is selected, a contextual toolbar appears near the block offering quick actions relevant to the selected element.

#### Position Guides

When moving or resizing an absolute block, visual guides appear to help you understand the block's position relative to its anchor point and the canvas edges.

#### Block Outlines

A dashed outline can be toggled to visualize the boundaries of all blocks on the canvas — useful for understanding layout and spacing. This is controlled via the header toggle.

---

## Header Bar

The header bar sits between the editor header (card name + save) and the canvas area. It provides global controls for the current card.

<!-- screenshot: builder-header-bar — Close-up of the header bar showing the Entities button, Actions button, container selector, and toggle buttons -->

### Left Section

| Control | Description |
|---------|-------------|
| **Entities** | Opens the Entity Slots manager overlay where you define reusable entity slots for the card. See [Entity Slots](panel-properties.md#entity-slots). |
| **Actions** | Opens the Action Slots manager overlay where you define reusable action slots for the card. See [Action Slots](panel-actions.md#action-slots). |

### Center Section — Container Selector

The center of the header bar shows a **Container Selector** dropdown. This control is part of the **Responsive Containers** system — a feature designed to let you create different style variations of your card for different screen sizes (e.g. Desktop, Tablet, Mobile).

> ⚠️ **Not yet available** — The container selector is visible in the header bar but the responsive containers feature is not yet active. Currently, all cards are designed in a single "Desktop" container. This section will be updated once the feature is released.

#### How It Will Work

The container manager will allow you to define **breakpoints** (containers) at specific widths. Each container represents a target viewport size:

| Container | Width | Description |
|-----------|-------|-------------|
| **Desktop** | No limit | The default container — always present, cannot be removed |
| **Tablet** | 768px | Targets tablet-sized viewports |
| **Mobile** | 480px | Targets mobile-sized viewports |

When the feature becomes available, you will be able to:

- Switch between containers in the builder to design container-specific style overrides
- Have styles **fall back** to the Desktop container when no override is defined for a specific breakpoint
- Preview your card at different sizes directly in the canvas

This will make it possible to create cards that gracefully adapt their layout and appearance depending on where they are displayed — for instance, rearranging blocks or changing font sizes for smaller screens.

### Right Section

| Control | Description |
|---------|-------------|
| **Blocks Outline** | Toggles the dashed outline on all blocks, making it easier to see block boundaries during design. |
| **Actions Toggle** | Enables/disables action interaction on the canvas. When enabled, clicking a block will trigger its actions (like it would in the dashboard) instead of selecting it. Useful for testing actions during design. |

---

## Working with the Canvas

### Selecting Blocks

Click on any block in the canvas to select it. The selected block is highlighted with a solid accent-colored border. The right sidebar panels automatically update to show the selected block's properties, styles, and actions.

You can also select blocks from the [Layers Panel](panel-layers.md).

### Selecting the Card

The card itself (the root element) can be selected. When selected, its properties and styles become editable in the right sidebar. The card exposes entity configuration (useful for setting a global entity inherited by all child blocks) and layout styles.

### Flow vs Absolute Positioning

Every block can be in one of two layout modes:

- **Flow** — The block follows the normal document flow, stacking sequentially with other flow blocks. Its position is determined by its order and the parent's layout settings (flex direction, gap, etc.).
- **Absolute** — The block is positioned freely on the canvas. You can drag it anywhere, and its position is defined by coordinates relative to a configurable anchor point.

You can switch a block between flow and absolute mode from the [Styles Panel](panel-styles.md#positioning).

---

**Next:** [Blocks Reference →](panel-blocks.md)

