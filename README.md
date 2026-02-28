# Card Builder – The Only Card You'll Ever Need!

The definitive Home Assistant custom integration for building fully custom, dynamic dashboard cards — entirely through a visual drag-and-drop interface. No YAML, no code, just design.

> [!WARNING]
>
> **PROJECT STATUS: BETA**
>
> This project is under active development.
> It is not stable, likely contains bugs, and might fail to work as expected.
>
> Use it at your own risk and expect breaking changes in future updates.

<!-- screenshot: hero-card-builder-overview — A wide screenshot showing the builder interface with a card being designed, showcasing the canvas, sidebars and a finished card in a dashboard -->

## What is Card Builder?

Card Builder is a Home Assistant custom integration that provides two core capabilities:

1. **Card Builder** — A full-featured visual editor (custom panel) where you design cards using drag-and-drop blocks, configure properties, apply styles, and bind data to your entities.

2. **Card Renderer** — A custom Lovelace card (`custom:card-builder-renderer-card`) that renders your designed cards in any Home Assistant dashboard, with live entity data and full interactivity.

## Key Features

### Visual Drag-and-Drop Builder

Design your cards in a dedicated full-screen builder with a central canvas and configurable sidebars. Drag blocks from the palette, arrange them visually, and see your changes in real time.

[→ Builder Overview](docs/builder-overview.md)

### Modular Block System

Cards are composed of individual blocks that can be nested, moved, and customized. Blocks are organized into categories: **Basic**, **Layout**, **Entities**, and **Controls** — from simple text to complex slider controls.

[→ Blocks Reference](docs/panel-blocks.md)

### Smart Entity Binding

Every block can be connected to Home Assistant entities. The **entity inheritance system** lets you set an entity once at the card level and have it automatically flow down to all child blocks — no need to repeat configuration.

[→ Properties Panel](docs/panel-properties.md)

### Reusable Cards with Entity Slots

Define **entity slots** in your card to turn it into a reusable template. When you place the card in a dashboard, you simply pick which entity to use for each slot. Update the card design once, and every instance updates automatically.

[→ Properties Panel – Entity Slots](docs/panel-properties.md#entity-slots)

### Full CSS Styling Control

Every block exposes the full spectrum of CSS styling properties — typography, colors, backgrounds, borders, spacing, effects, and more. Blocks with sub-components (like Entity State with its value and unit) allow independent styling of each part through **style targets**.

[→ Styles Panel](docs/panel-styles.md)

### Flexible Positioning

Choose between **flow** (document-order) and **absolute** positioning for each block. Absolute positioning supports **9 anchor points**, both **pixel and percentage** units, and customizable origin points for precise, responsive layouts.

[→ Styles Panel – Positioning](docs/panel-styles.md#positioning)

### Dynamic Style Binding

Go beyond static values — bind any style property to entity state. Five binding modes are available: **Direct** (with range mapping), **Map**, **Threshold**, **Condition** (with logical operators), and **Template**. Make a background change color based on temperature, adjust opacity based on brightness, and much more.

[→ Styles Panel – Bindings](docs/panel-styles.md#style-bindings)

### Style Presets

Save and reuse sets of style configurations as **presets**. Apply a preset to instantly style a block, or use preset inheritance to create a consistent design system across all your cards.

[→ Styles Panel – Presets](docs/panel-styles.md#style-presets)

### Configurable Actions

Assign actions to blocks and their sub-components using **tap**, **double tap**, and **hold** triggers. Supported actions include **toggle**, **call service / perform action**, **navigate**, **more info**, **open URL**, and more. Actions are defined through **action slots** and can be configured at the dashboard level for maximum reusability.

[→ Actions Panel](docs/panel-actions.md)

### Visual Entity Links

Draw SVG connection lines between blocks with the **Link block** — a special block created via the header bar toggle. Links support multi-point paths with line and Bézier curve segments, point anchoring to other blocks, and animated particle flow driven by entity state. Ideal for energy flow diagrams, system topologies, and any card that needs to visualize relationships between entities.

[→ Link Block](docs/block-link.md)

### Card Management Panel

A full management panel with dashboard overview, card list with search/sort/pagination, card creation, editing, duplication, deletion, and JSON import.

[→ Panel Overview](docs/panel-overview.md)

## Installation

### HACS (Recommended)

1. Open HACS in your Home Assistant instance
2. Go to **Integrations**
3. Click the **⋮** menu → **Custom repositories**
4. Add the repository URL and select **Integration** as category
5. Search for "Card Builder" and install it
6. Restart Home Assistant
7. Go to **Settings → Devices & Services → Add Integration** and search for "Card Builder"

### Manual Installation

1. Download the latest release from the [GitHub releases page](https://github.com/studiobts/home-assistant-card-builder/releases)
2. Copy the `card_builder` folder to your `config/custom_components/` directory
3. Restart Home Assistant
4. Go to **Settings → Devices & Services → Add Integration** and search for "Card Builder"

Once installed, the **Card Builder** panel will appear in the Home Assistant sidebar.

## Documentation

| Document | Description |
|----------|-------------|
| [Panel Overview](docs/panel-overview.md) | Management panel, card list, navigation |
| [Builder Overview](docs/builder-overview.md) | Builder layout, canvas, header controls |
| [Blocks Reference](docs/panel-blocks.md) | All available block types and their properties |
| [Link Block](docs/block-link.md) | Visual connection lines, path editor, flow animation |
| [Layers Panel](docs/panel-layers.md) | Layer tree, block selection, ordering |
| [Properties Panel](docs/panel-properties.md) | Block properties, entity configuration, slots |
| [Styles Panel](docs/panel-styles.md) | CSS styling, positioning, presets, bindings |
| [Actions Panel](docs/panel-actions.md) | Actions, triggers, action slots |
| [Card Renderer](docs/card-renderer.md) | Dashboard usage, card editor, slot configuration |

## Current Limitations

- **Pre-alpha status** — Expect breaking changes and bugs
- **Export not yet available** — Card export for sharing is planned but not implemented
- **No undo/redo** — History system is on the roadmap
- **English-only UI** — The builder interface is currently available only in English

## Roadmap

> Note: Execution order and priorities are not yet defined — items listed below are goals under consideration.

- [x] **Configurable actions for each block (tap / double tap / hold)**: Allow users to assign different interactions to individual blocks so the same block can perform different behaviors depending on the gesture. This enables richer, context-sensitive control and automation triggers.

- [ ] **Export of created card(s) for sharing** — Enable exporting one or multiple cards as shareable JSON artifacts, making it easy to share configurations or move them between systems.

- [ ] **Save and reuse sets of preconfigured blocks as templates** — Allow users to save a selection of blocks as a reusable template or snippet to speed up assembly of common layouts and patterns.

- [ ] **History (undo/redo) for any modification** — Implement a reliable undo/redo system so users can confidently experiment and revert changes at any granularity.

- [ ] **Domain-specific blocks (light, fan, switch, etc.)** — Offer pre-configured blocks tailored to Home Assistant domains so entity-specific controls, states, and actions are handled with minimal setup and proper UX.

- [ ] **Cloud backup of save history for quick restore** — Offer optional cloud storage for save history to support recovery from accidental deletion and automatic backups.

- [ ] **Marketplace for sharing and downloading ready-made cards/templates** — Create a discoverable marketplace where members can publish and download templates.

- [ ] **Internal AI agent for automated card generation** — Integrate an internal assistant/agent to help generate or suggest card layouts and templates automatically from high-level prompts or entity lists.

## License

This project is licensed under the [AGPLv3 License](LICENSE).

## Contributing

Contributions are welcome! Please open an issue or pull request on the [GitHub repository](https://github.com/studiobts/home-assistant-card-builder).
