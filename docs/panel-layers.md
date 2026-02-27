# Layers Panel

The Layers panel provides a tree view of all blocks in your card, giving you a clear overview of the block hierarchy and an alternative way to select and navigate blocks.

It is located in the **left sidebar**, accessible via the **Layers** tab.

<!-- screenshot: panel-layers — The layers panel showing a hierarchical tree of blocks with indentation, expand/collapse toggles, and one block highlighted as selected -->

## Block Tree

The layers tree mirrors the structure of the blocks on the canvas:

- **Top-level blocks** appear at the root of the tree
- **Nested blocks** (inside containers, columns, or grids) are indented under their parent
- **Expand/collapse toggles** (▶/▼) allow you to show or hide child blocks for layout blocks

Each entry in the tree displays:

| Element | Description |
|---------|-------------|
| **Toggle arrow** | Expand or collapse children (only for blocks that accept children) |
| **Block icon** | The icon representing the block type |
| **Block label** | The user-defined name, or the default block type label if no custom name is set |
| **Parent reference** | For absolute blocks shown outside their parent's tree section, a clickable link to the parent block |

## Selecting Blocks

Click on any block in the layers tree to **select it**. This has the same effect as clicking the block on the canvas:

- The block is highlighted on the canvas with an accent-colored border
- The right sidebar panels update to show the selected block's properties, styles, and actions
- The layers entry itself is highlighted

Selection is bidirectional — selecting a block on the canvas also highlights it in the layers tree, and vice versa.

## Absolute Blocks Toggle

At the top of the layers panel, a toggle button controls how **absolute-positioned blocks** are displayed in the tree:

<!-- screenshot: panel-layers-absolute-toggle — The layers panel header showing the "Absolute" toggle button, with the toggle in active state -->

| Mode | Behavior |
|------|----------|
| **Toggle OFF** | Absolute blocks are shown within their parent's tree hierarchy, alongside flow blocks |
| **Toggle ON** | Absolute blocks are extracted from the tree and shown in a separate flat list below the main tree, making it easier to manage overlapping elements |

This is particularly useful when you have many absolute blocks that overlap in the canvas — the separated view lets you find and select them without confusion.

## Block Ordering

The order of blocks in the layers tree reflects their **render order** on the canvas:

- For **flow blocks**: the tree order matches the visual stacking order (top to bottom in the tree = first to last in flow)
- For **absolute blocks**: the tree order relates to the z-index stacking (later blocks appear on top of earlier ones)

---

**Next:** [Properties Panel →](panel-properties.md)

