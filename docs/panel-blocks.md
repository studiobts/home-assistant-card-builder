# Blocks Reference

Blocks are the building elements of every card. Each block is a self-contained component that can be dragged from the palette onto the canvas, configured, styled, and connected to Home Assistant entities.

The Blocks panel in the left sidebar organizes all available blocks into categories. Click on a category header to expand or collapse it.

<!-- screenshot: panel-blocks-expanded — The blocks panel in the left sidebar showing all categories expanded with their block items -->

## Block Categories

| Category | Purpose |
|----------|---------|
| **Basic** | Simple content blocks (text) |
| **Layout** | Structural blocks that organize other blocks (container, columns, grid) |
| **Entities** | Blocks that display data from Home Assistant entities (state, name, icon, attribute, image) |
| **Controls** | Interactive blocks for controlling entities (slider, button toggle, select menu) |

---

## Adding Blocks

To add a block to your card:

1. Find the desired block in the **Blocks** panel
2. **Drag** the block from the palette
3. **Drop** it onto the canvas or into a layout block

Blocks can be dropped:
- Directly on the canvas as a top-level block
- Inside a **layout block** (Container, Columns, Grid) to nest them

---

## Basic Blocks

### Text

A simple text content block. Displays a static or dynamically bound text string.

| Property | Description |
|----------|-------------|
| **Text** | The text content to display. Supports binding to entity state. |

**Entity**: Optional (inherited by default). When bound, the text property can reference entity state via binding.

**Style Targets**: None (only the block itself).

---

### Icon

A basic icon block with optional templates before and after the icon. The icon can be selected directly, bound to an entity, or resolved via a template.

| Property | Description |
|----------|-------------|
| **Icon Source** | Choose where the icon comes from: List or Template. |
| **Icon** | Icon to display (e.g., `mdi:star-outline`). Supports binding (shown when Icon Source is List). |
| **Icon Template** | Jinja2 template that resolves to an icon name (shown when Icon Source is Template). |
| **Pre Template** | Optional template rendered before the icon. |
| **Post Template** | Optional template rendered after the icon. |

**Entity**: Optional (inherited by default). When bound, templates can reference entity state via template keywords.

**Style Targets**:

| Target | Description |
|--------|-------------|
| **Icon** | The icon element |
| **Pre Template** | Text rendered before the icon |
| **Post Template** | Text rendered after the icon |

---

### Image

Displays an image from an external URL or the built-in [Media Manager](media-manager.md). Supports multiple fitting and positioning options to control how the image fills the block.

<!-- screenshot: block-image — An image block on the canvas showing a loaded picture with object-fit and position controls visible in the properties panel -->

| Property | Description |
|----------|-------------|
| **Image Source** | Where the image comes from: None, Image URL, or Media Library |
| **Image URL** | Direct URL to the image (shown when Image Source is Image URL). Supports binding. |
| **Media** | Pick an image from the [Media Manager](media-manager.md) (shown when Image Source is Media Library). Supports binding. |
| **Image Fit** | How the image fills its container: None (default), Contain (fit inside), Cover (fill & crop), Stretch (fill), Scale Down Only, or Original Size |
| **Image Position** | Alignment of the image within the block: Center, Top, Bottom, Left, Right, and corner combinations. Choose Custom to enter a free-form value. Supports binding. |
| **Custom Position** | Free-form CSS `object-position` value, e.g. `20% 80%` (shown when Image Position is Custom). Supports binding. |

**Entity**: Optional (inherited by default). When bound, the URL and media reference properties can be set dynamically via binding.

**Style Targets**: None (only the block itself).

---

## Layout Blocks

Layout blocks are the structural building elements that organize other blocks. They are the only blocks that accept child blocks dropped inside them.

### Container

A generic flex container that holds child blocks. Use it to group and organize blocks within a flexible layout.

<!-- screenshot: block-container — A container block on the canvas with several child blocks inside, showing the flex arrangement -->

| Property | Description |
|----------|-------------|
| *(none)* | The container has no custom properties. Its behavior is configured entirely through styles (flex direction, gap, alignment, etc.). |

**Entity**: Optional (inherited by default). Setting an entity on a container makes it available to all child blocks via inheritance.

**Accepts Children**: ✅ Yes — any block can be dropped inside.

**Styling**: Full layout styles including flex direction, flex wrap, justify-content, align-items, gap, and all standard CSS properties.

---

### Columns

Splits the layout into a configurable number of equal columns with optional gap. Individual column widths can be resized by dragging the column separator handles.

<!-- screenshot: block-columns — A columns block showing 3 columns with different content, resize handles visible between columns -->

| Property | Description |
|----------|-------------|
| **Columns** | Number of columns (2–12, default: 2) |
| **Gap** | Space between columns in pixels (default: 0) |

**Entity**: Optional (inherited by default).

**Accepts Children**: ✅ Yes — each column is an independent drop zone that accepts any blocks.

**Resizing**: Hover between columns to see the resize handle. Drag it to adjust the relative width of adjacent columns. A label overlay shows the current width percentage while dragging.

---

### Grid

A CSS Grid-based layout with configurable rows, columns, sizes, areas, and gaps. Provides the most powerful layout control.

<!-- screenshot: block-grid — A grid block showing a 3x2 grid with named areas, some cells containing blocks -->

| Property | Description |
|----------|-------------|
| **Grid Editor** | Opens a dedicated grid editor overlay for visual grid configuration |

**Entity**: Optional (inherited by default).

**Accepts Children**: ✅ Yes — each grid cell (or named area) is an independent drop zone.

#### Grid Editor

The grid editor is a dedicated visual overlay that lets you configure:

<!-- screenshot: grid-editor-overlay — The grid editor overlay showing a visual grid with row/column size controls, area management, and gap settings -->

| Setting | Description |
|---------|-------------|
| **Rows** | Number of rows |
| **Columns** | Number of columns |
| **Row Sizes** | Size of each row (supports `px`, `%`, `fr`, `auto`, `minmax` units) |
| **Column Sizes** | Size of each column (same units as rows) |
| **Areas** | Named grid areas that can span multiple cells |
| **Gap** | Row gap and column gap in pixels |

**Grid Units:**
- `fr` — Fractional unit, distributes available space proportionally
- `px` — Fixed pixel size
- `%` — Percentage of the container
- `auto` — Size based on content
- `minmax` — Defines a minimum and maximum size range

---

## Entity Blocks

Entity blocks display data from Home Assistant entities. All entity blocks **require an entity** to function. The entity can come from [inheritance, a slot, or a fixed configuration](panel-properties.md#entity-configuration).

When no entity is available, entity blocks show a "No entity selected" placeholder.

### Entity State

Displays the current state value of an entity, with optional unit of measurement.

<!-- screenshot: block-entity-state — An entity state block showing "22.5 °C" with the value and unit styled differently -->

| Property | Description |
|----------|-------------|
| **Format** | How to format the value: Text, Numeric, Integer, Date/Time, Boolean, or Template |
| **Precision** | Decimal places for numeric formats (0–10) |
| **Date Format** | Format for date values: Full, Long, Medium, Short, Time Only, Date & Time, Relative, ISO 8601 |
| **Format Template** | Jinja2 template for custom formatting (when format is Template). Available keywords: `{{ value }}`, `{{ state }}`, `{{ entity_id }}` |
| **Custom State** | Override the displayed text. Use `{{ state }}` to include the entity state within custom text, or `{{ name }}` for the entity name. |
| **Show Unit** | Whether to display the unit of measurement |
| **Custom Unit** | Override the auto-detected unit |

**Style Targets:**

| Target | Description |
|--------|-------------|
| **State value** | The main state text |
| **Unit** | The unit of measurement text displayed after the value |

**Action Targets:**

| Target | Description |
|--------|-------------|
| **State** | The state value element |
| **Unit** | The unit element |

---

### Entity Name

Displays the friendly name of an entity with formatting and truncation options.

| Property | Description |
|----------|-------------|
| **Custom Name** | Override the entity name. Use `{{ name }}` to include the original name within custom text. |
| **Case** | Text transformation: None, Upper, Lower, Title, Kebab, Camel |
| **Max Length** | Maximum character count before truncation (0 = no limit) |
| **Use Ellipsis** | Show "..." when text overflows (when Max Length is 0, uses CSS ellipsis) |

**Style Targets**: None (only the block itself).

---

### Entity Icon

Displays the entity's icon with configurable size and color modes.

<!-- screenshot: block-entity-icon — An entity icon block showing a lightbulb icon with a yellow color -->

| Property | Description |
|----------|-------------|
| **Icon Size** | Icon size in pixels (12–128, default: 24) |
| **Color Mode** | How to determine the icon color: Fixed, State-based, or Availability-based |
| **Color** | Fixed color value (when Color Mode is Fixed) |
| **Available Color** | Color when entity is available (when Color Mode is Availability-based) |
| **Unavailable Color** | Color when entity is unavailable (default: gray) |

**Style Targets**: None (only the block itself).

---

### Entity Attribute

Displays a single attribute of an entity with an optional label, formatting, and prefix/suffix.

| Property | Description |
|----------|-------------|
| **Attribute Name** | The attribute to display (picker with autocomplete from entity attributes) |
| **Show Label** | Whether to show a label above/beside the value |
| **Custom Label** | Override the auto-generated label |
| **Label Position** | Where to place the label: Top, Left, or Inline |
| **Format** | Value formatting: Text, Numeric, Integer, Date/Time, Boolean, or Template |
| **Precision** | Decimal places for numeric formats |
| **Date Format** | Format for date values |
| **Format Template** | Jinja2 template for custom formatting |
| **Prefix** | Text prepended to the value |
| **Suffix** | Text appended to the value |

**Style Targets:**

| Target | Description |
|--------|-------------|
| **Label** | The attribute label text |
| **Value** | The formatted attribute value |

**Action Targets:**

| Target | Description |
|--------|-------------|
| **Label** | The label element |
| **Value** | The value element |

---

### Entity Image

Displays the entity's picture (`entity_picture` attribute) with a fallback icon.

| Property | Description |
|----------|-------------|
| **Custom Image URL** | Override the entity picture with a custom URL |
| **Fallback Icon** | Icon shown when no image is available (default: `mdi:image-off-outline`). Supports binding. |

**Style Targets**: None (only the block itself).

---

## Control Blocks

Control blocks provide interactive elements for controlling Home Assistant entities.

### Slider

A fully-featured slider control for entities that support numeric values — lights (brightness), fans (speed), covers (position/tilt), climate (temperature), media players (volume), input numbers, and more.

<!-- screenshot: block-slider — A slider block controlling a light entity, showing the filled track, thumb, and value label -->

The slider automatically detects the entity domain and configures itself with appropriate min/max values, step, unit, and service calls. Most settings have an **Auto** mode that does the right thing for each domain.

#### Appearance Properties

| Property | Description |
|----------|-------------|
| **Orientation** | Slider direction: Horizontal or Vertical |
| **Shape** | Track shape: Rounded or Square |
| **Show Thumb** | Whether to display the draggable thumb |
| **Show Value** | Whether to display the current value |
| **Value Position** *(horizontal)* | Where to show the value in horizontal mode: Inline (beside the slider), Tooltip (above thumb while dragging), or Inside (within the track) |
| **Inline Position** *(horizontal)* | When Inline: Left or Right |
| **Inside Position** *(horizontal)* | When Inside: Left, Center, or Right |
| **Value Position** *(vertical)* | Where to show the value in vertical mode: Top (above the slider), Bottom (below the slider), Inside (within the track), or Tooltip |
| **Inside Position** *(vertical)* | When Inside: Top, Middle, or Bottom |
| **Invert** | Reverse the slider direction |

#### Behavior Properties

| Property | Description |
|----------|-------------|
| **Activation** | How the slider starts: Press (immediate) or Hold (requires holding before dragging) |
| **Enable Tap Action** | (Hold mode only) Enable a tap action when quickly tapping instead of holding |
| **Tap Action** | (Hold mode only) What happens on tap: More Info or Toggle |
| **Mode** | Slider mode: Auto, Single (one thumb), or Range (two thumbs for min/max) |
| **Cover Control** | (Covers only) Which value to control: Auto, Position, or Tilt |
| **Value Source** | Where to read the value from: State or a specific Attribute |
| **Value Attribute** | (When Value Source is Attribute) The attribute name to use |
| **Display Mode** | How values are displayed: Auto, Raw (entity units), Percent (0–100%), or Custom |
| **Display Min/Max** | (Custom mode) Custom display range boundaries |
| **Commit Mode** | When to send the value to Home Assistant: On Release, Throttled (during drag at interval), or Debounced (after drag pause) |
| **Commit Throttle/Debounce** | Time interval in milliseconds for throttled/debounced modes |
| **Disable Mode** | When to disable the slider: Auto (based on entity state), Custom (manual control), or Never |
| **Range Min Gap** | (Range mode) Minimum gap between low and high thumbs |

#### Override Properties

| Property | Description |
|----------|-------------|
| **Use Min Override** | Override the entity's minimum value |
| **Min Override** | Custom minimum value |
| **Use Max Override** | Override the entity's maximum value |
| **Max Override** | Custom maximum value |
| **Use Step Override** | Override the entity's step value |
| **Step Override** | Custom step increment |
| **Use Precision Override** | Override decimal precision |
| **Precision Override** | Number of decimal places |

**Style Targets:**

| Target | Description |
|--------|-------------|
| **Track** | The entire slider track container |
| **Track Inactive** | The unfilled portion of the track |
| **Track Active** | The filled/active portion of the track |
| **Thumb** | The single slider thumb (single mode) |
| **Thumb Low** | The low-value thumb (range mode) |
| **Thumb High** | The high-value thumb (range mode) |
| **Value** | The value label text |
| **Tooltip** | The tooltip bubble that appears during drag |

> **Note:** Style targets for Thumb Low and Thumb High are only available when the slider is in Range mode.

**Action Targets:**

| Target | Description |
|--------|-------------|
| **Value** | The value label element |

> The slider does **not** expose a default block-level action target because it handles interaction natively (drag/tap).

#### Supported Domains

The slider auto-configures for these Home Assistant domains:

| Domain | Default Control | Range | Unit |
|--------|----------------|-------|------|
| `light` | Brightness | 0–255 | % (displayed 0–100) |
| `fan` | Speed/Percentage | 0–100 | % |
| `cover` | Position or Tilt | 0–100 | % |
| `media_player` | Volume | 0–1 | % (displayed 0–100) |
| `climate` | Temperature | min/max from entity | °C/°F |
| `humidifier` | Humidity | min/max from entity | % |
| `water_heater` | Temperature | min/max from entity | °C/°F |
| `input_number` | Value | min/max from entity | entity unit |
| `number` | Value | min/max from entity | entity unit |
| `valve` | Position | 0–100 | % |

---

### Button Toggle

A segmented button group that lets users pick one option among a set of mutually exclusive choices. Ideal for switching between entity modes, presets, or states — such as climate HVAC modes, fan preset modes, light effects, or simple on/off toggles.

<!-- screenshot: block-button-toggle — A button toggle block showing horizontal segmented buttons for climate HVAC modes (Heat, Cool, Auto) with the active option highlighted -->

The block uses a **feature-based** system: it automatically detects what options are available for the connected entity's domain and lets you pick which feature to control. If the entity only exposes one feature, it is selected automatically.

#### Options Properties

| Property | Description |
|----------|-------------|
| **Feature** | Which entity feature to control. Set to Auto to let the block pick the first available feature, or choose a specific one from the list (e.g., HVAC Mode, Fan Mode, Preset Mode). The available features depend on the entity's domain and attributes. |

#### Appearance Properties

| Property | Description |
|----------|-------------|
| **Orientation** | Button layout direction: Horizontal (side by side) or Vertical (stacked) |
| **Show Icon** | Whether to display an icon for each option |
| **Show Label** | Whether to display a text label for each option |
| **Icon + Label Layout** | How icon and label are arranged within each button: Horizontal (side by side) or Vertical (stacked). Only visible when both icon and label are shown. |
| **Content Order** | Which element appears first: Icon First or Label First. Only visible when both icon and label are shown. |
| **Vertical Align** | Text/content alignment when orientation is Vertical: Left, Center, or Right |

**Style Targets:**

| Target | Description |
|--------|-------------|
| **Container** | The outer segmented button group container |
| **Option** | An inactive option button |
| **Option Active** | The currently active/selected option button |
| **Icon** | An inactive option's icon |
| **Icon Active** | The active option's icon |
| **Label** | An inactive option's label text |
| **Label Active** | The active option's label text |

> The active targets (Option Active, Icon Active, Label Active) are applied **on top of** the base targets. This lets you define a default style and only override the differences for the selected option — for example, changing just the text color and background without repeating everything else.

> The Button Toggle does **not** expose a default block-level action target because it handles interaction natively.

#### Supported Domains

The button toggle auto-detects features for these domains:

| Domain | Available Features |
|--------|--------------------|
| `climate` | HVAC Mode, Fan Mode, Swing Mode, Preset Mode |
| `fan` | Power (on/off), Preset Mode, Speed |
| `light` | Power (on/off), Effect |
| `media_player` | Source, Sound Mode |
| `humidifier` | Mode |
| `water_heater` | Operation Mode |
| `cover` | Open/Close |
| `lock` | Lock/Unlock |
| `vacuum` | Fan Speed |
| `switch` | Power (on/off) |
| `input_boolean` | State (on/off) |
| `siren` | State (on/off) |
| `automation` | Enabled (on/off) |
| `select` | Option |
| `input_select` | Option |

---

### Select Menu

A dropdown select control for choosing one option from an entity's available values. It works just like the Button Toggle but presents options in a compact dropdown menu — useful when there are many options or limited space.

<!-- screenshot: block-select-menu — A select menu block showing a dropdown with climate HVAC mode options, one option highlighted as selected -->

Like the Button Toggle, the Select Menu uses the same **feature-based** system — it auto-detects available features from the entity's domain and attributes.

#### Options Properties

| Property | Description |
|----------|-------------|
| **Feature** | Which entity feature to control. Same auto-detection as Button Toggle. |

#### Appearance Properties

| Property | Description |
|----------|-------------|
| **Show Container Icon** | Whether to show the selected option's icon in the closed select button |
| **Show Container Label** | Whether to show the selected option's label in the closed select button |
| **Show Dropdown Icon** | Whether to show icons for options in the dropdown list |
| **Show Dropdown Label** | Whether to show labels for options in the dropdown list |
| **Content Order** | Which element appears first within each option: Icon First or Label First |
| **Dropdown Placement** | Where the dropdown opens relative to the button: Below or Above |

**Style Targets:**

| Target | Description |
|--------|-------------|
| **Container** | The closed select button |
| **Dropdown** | The dropdown panel |
| **Container Icon** | The icon in the closed select button |
| **Container Label** | The label in the closed select button |
| **Dropdown Icon** | Option icons in the dropdown list |
| **Dropdown Label** | Option labels in the dropdown list |
| **Selected Icon** | The icon of the currently selected option in the dropdown |
| **Selected Label** | The label of the currently selected option in the dropdown |

> The Select Menu does **not** expose a default block-level action target because it handles interaction natively.

#### Supported Domains

The Select Menu supports the same domains and features as the [Button Toggle](#supported-domains-1).

---

**Next:** [Layers Panel →](panel-layers.md)
