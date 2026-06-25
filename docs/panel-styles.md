# Styles Panel

The Styles panel gives you full control over the visual appearance of every block. It exposes CSS styling properties organized into logical groups, supports a powerful positioning system, style presets, and dynamic binding to entity state.

It is located in the **right sidebar**, accessible via the **Styles** tab.

When no block is selected, the panel shows a placeholder message.

<!-- screenshot: panel-styles-overview — The styles panel showing a selected block with the style target selector, preset section, and several expanded property groups -->

## Style Targets

Many blocks have **sub-components** that can be styled independently. For example, the Entity State block has a "State value" and a "Unit" target — letting you apply different font sizes, colors, or effects to each part.

When a block has multiple style targets, a **target selector** appears at the top of the Styles panel:

<!-- screenshot: styles-target-selector — The style target selector showing options like "Block", "State value", and "Unit" -->

| Target | Description |
|--------|-------------|
| **Block** | The block's outer container — always available |
| **Custom targets** | Sub-component targets defined by the block type (e.g., "Track", "Thumb", "Value" for the Slider) |

Selecting a target highlights the corresponding element on the canvas with a dashed accent border, so you can see exactly which part you're styling.

See each block's documentation in the [Blocks Reference](panel-blocks.md) for a list of available style targets.

---

## Property Groups

Style properties are organized into **8 collapsible groups**. Each group can be expanded or collapsed by clicking its header. The available groups depend on the block type and the selected style target.

### Layout

Controls the block's display and positioning behavior.

| Property | Description |
|----------|-------------|
| **Show** | Toggle visibility of the block (display: none) |
| **Overflow** | How content overflow is handled (`visible`, `hidden`, `scroll`, `auto`) |
| **Overflow X / Y** | Individual axis overflow control |
| **Z-Index** | Stacking order for overlapping blocks |
| **Position X / Y** | Position coordinates (for absolute blocks) |

### Size

Controls the block's dimensions.

| Property | Description |
|----------|-------------|
| **Width / Height** | Explicit dimensions with unit selector (px, %, rem, em, vw, vh) |
| **Min Width / Min Height** | Minimum dimensions |
| **Max Width / Max Height** | Maximum dimensions |

### Spacing

Controls margins and padding around and within the block.

| Property | Description |
|----------|-------------|
| **Margin** | Outer spacing (all sides, or individual: Top, Right, Bottom, Left) |
| **Padding** | Inner spacing (all sides, or individual: Top, Right, Bottom, Left) |

### Typography

Controls text appearance.

| Property | Description |
|----------|-------------|
| **Color** | Text color |
| **Text Align** | Horizontal alignment (`left`, `center`, `right`, `justify`) |
| **Font Size** | Size with unit selector |
| **Font Weight** | Thickness (100–900, normal, bold) |
| **Font Family** | Font family name |
| **Font Style** | Normal or italic |
| **Line Height** | Vertical spacing between lines |
| **Text Transform** | Case transformation: None, Capitalize, Uppercase, Lowercase |
| **Text Decoration** | None, Underline, Overline, Line Through |
| **Text Shadow** | Text shadow value |
| **Letter Spacing** | Space between characters |
| **White Space** | How whitespace is handled: Normal, No-Wrap, Pre, Pre-Wrap, Pre-Line, Break-Spaces |

### Background

Controls the block's background.

| Property | Description |
|----------|-------------|
| **Background Color** | Solid background color |
| **Background Image** | Image URL, CSS gradient, or custom value. Use the media picker button to select an image from the [Media Manager](media-manager.md). |
| **Background Size** | How the image scales: Auto, Cover, Contain, or Custom |
| **Background Position** | Image positioning (center, top, bottom, etc., or Custom with X/Y values) |
| **Background Repeat** | Image tiling behavior |
| **Box Shadow** | Shadow effect around the block |
| **Background Blend Mode** | How the background blends with content below |

### Border

Controls border and corner radius.

| Property | Description |
|----------|-------------|
| **Border Width** | Overall border width, or individual sides (Top, Right, Bottom, Left) |
| **Border Style** | Border line style (solid, dashed, dotted, etc.) |
| **Border Color** | Border color |
| **Border Radius** | Corner rounding, or individual corners (Top-Left, Top-Right, Bottom-Right, Bottom-Left) |

### Effects

Visual effects applied to the block.

| Property | Description |
|----------|-------------|
| **Opacity** | Transparency (0 = invisible, 1 = fully opaque) |
| **Box Shadow** | Drop shadow |
| **Filter** | CSS filter (blur, brightness, contrast, grayscale, etc.) |
| **Backdrop Filter** | Filter applied to the area behind the block |
| **Mix Blend Mode** | How the block blends with elements below |
| **Rotate** | Rotation angle |

### Flex

Controls flex container and item behavior. Available on layout blocks and flex children.

| Property | Description |
|----------|-------------|
| **Flex Direction** | Main axis direction: row, column, row-reverse, column-reverse |
| **Flex Wrap** | Whether items wrap to new lines |
| **Justify Content** | Alignment along the main axis |
| **Align Items** | Alignment along the cross axis |
| **Align Content** | Multi-line alignment |
| **Gap** | Space between flex items |
| **Row Gap / Column Gap** | Individual axis gaps |
| **Flex Grow** | How much the item grows to fill available space |
| **Flex Shrink** | How much the item shrinks when space is tight |
| **Flex Basis** | Initial size before growing/shrinking |
| **Align Self** | Override alignment for a specific item |
| **Order** | Visual order within the flex container |

### Units

Most numeric style properties support multiple **CSS units**:

| Unit | Description |
|------|-------------|
| `px` | Pixels — fixed, absolute size |
| `%` | Percentage of parent element |
| `rem` | Relative to the root font size |
| `em` | Relative to the current font size |
| `vw` | Percentage of viewport width |
| `vh` | Percentage of viewport height |

---

## Positioning

Every block can be in one of two layout modes: **Flow** or **Absolute**.

### Flow Positioning

**Flow** is the default mode. Blocks are positioned sequentially according to the parent's layout rules (flex direction, wrapping, etc.). You don't set explicit coordinates — the position is automatic.

### Absolute Positioning

**Absolute** mode lets you place a block at any position on the canvas. When you switch a block to absolute mode, you can drag it freely.

<!-- screenshot: styles-absolute-positioning — An absolute block on the canvas with position guides showing the anchor point, coordinate values, and the origin point -->

#### Anchor Points

The position is defined **relative to an anchor point** on the canvas. There are 9 anchor points:

```
┌──────────┬──────────┬──────────┐
│ top-left │ top-ctr  │ top-right│
├──────────┼──────────┼──────────┤
│ mid-left │ mid-ctr  │ mid-right│
├──────────┼──────────┼──────────┤
│ btm-left │ btm-ctr  │ btm-right│
└──────────┴──────────┴──────────┘
```

The anchor determines the reference point from which the X/Y coordinates are measured.

#### Origin Points

The **origin point** determines which point on the *block itself* is aligned to the anchor. By default, the origin matches the anchor. For example:

- Anchor `top-left` + Origin `top-left` → The block's top-left corner is at the specified position
- Anchor `middle-center` + Origin `middle-center` → The block's center is at the specified position
- Anchor `bottom-right` + Origin `top-left` → The block's top-left corner is at the specified distance from the canvas bottom-right

#### Unit Systems

Position coordinates can use two unit systems:

| Unit | Description |
|------|-------------|
| **px** (pixels) | Fixed distance from the anchor point. The block stays at the exact pixel position regardless of canvas size. |
| **%** (percentage) | Relative distance as a percentage of the canvas dimensions. The block adapts proportionally when the canvas size changes. |

#### Practical Example

Consider a block that should always stay in the bottom-right corner of the card, with a small margin:

- **Anchor**: `bottom-right`
- **Origin**: `bottom-right`
- **Unit**: `%`
- **X**: `5` (5% from the right edge)
- **Y**: `5` (5% from the bottom edge)

This block will stay at 5% from the bottom-right corner regardless of the card's dimensions — making it truly responsive.

#### Position Guides

When you move or resize an absolute block, **visual guides** appear on the canvas showing:

- Lines from the anchor point to the block
- Coordinate values in the current unit system
- The anchor point indicator on the canvas edge

Position guides can be toggled on/off in the builder header.

---

## Theme Mode Overrides

Card Builder supports per-theme-mode overrides for visual properties that commonly need different values in Home Assistant light and dark themes. The goal is to keep a single reusable card that works in both modes, instead of duplicating the card and maintaining separate light and dark versions.

The builder header includes a **theme mode selector** with three modes:

| Mode | What you edit |
|------|---------------|
| **Auto** | The base value. This is the mode-independent fallback used whenever no light or dark override exists. |
| **Light** | The light-mode override for supported properties. |
| **Dark** | The dark-mode override for supported properties. |

The base value is not treated as the light value. It is the portable, mode-independent default for the card. This matters when cards are shared through the Marketplace: a card created in one user's light theme should still have a meaningful fallback when another user installs it in a dark theme.

Theme mode overrides currently apply to color-related style properties and background images, including text color, background color, border color, SVG fill/stroke, chart colors, and **Background Image**. Background images can be overridden per mode so you can use a different image or a different CSS gradient in light and dark themes.

When editing a supported property:

- In **Auto**, changes are saved to the base value.
- In **Light**, changes are saved only to the light override.
- In **Dark**, changes are saved only to the dark override.
- Resetting a property resets only the currently selected mode: base, light, or dark.

If a property has an override for the selected mode, the Styles panel shows a small theme-mode indicator next to the property origin badge. The normal custom-origin badge and reset button also follow the selected mode, so a dark-only override does not make the property appear customized while editing Auto or Light.

At runtime, the renderer uses Home Assistant's active theme mode and resolves values in this order:

1. Start from the base value.
2. Apply the active mode override if one exists.
3. Evaluate any binding selected by that resolved value.

The editor preview can switch between Auto, Light, and Dark to inspect these values. When previewing the opposite Home Assistant theme mode, Card Builder resolves its own saved overrides, but Home Assistant-native CSS variables such as `var(--primary-text-color)` still come from the currently active Home Assistant theme.

---

## Style Presets

Style presets let you **save and reuse** sets of style configurations across blocks and cards.

<!-- screenshot: styles-preset-section — The preset section of the styles panel showing the preset selector dropdown and save/manage buttons -->

### Applying a Preset

Use the **preset selector** at the top of the Styles panel to apply a saved preset to the currently selected block and target. When a preset is applied, its style values are used as the base — you can then override individual properties on top.

### Saving a Preset

To save the current block's styles as a preset:

1. Configure the styles as desired
2. Click the **Save as Preset** button
3. Enter a name and optional description
4. The preset is saved and immediately available for other blocks

### Preset Inheritance

Presets can **extend** other presets, creating a hierarchy:

```
Base Theme (font, colors)
  └── Card Preset (background, border, padding)
        └── Header Preset (larger font, bold)
```

When a preset extends another, it inherits all its parent's values and can override specific ones. Changes to the parent preset automatically cascade down.

### Managing Presets

A preset manager dialog lets you view, edit, rename, and delete saved presets.

---

## Style Bindings

The binding system lets you **connect any style property to live entity data**. This is what makes Card Builder cards truly dynamic — colors, sizes, opacity, backgrounds, and any other property can change in real-time based on entity state.

<!-- screenshot: styles-binding-editor — The binding editor overlay showing a condition-based binding that changes background color based on entity state -->

### Opening the Binding Editor

Next to most style properties, a **binding button** (🔗) is available. Click it to open the binding editor overlay for that property.

### Entity Source

Every binding reads its input value from an **entity source**:

| Setting | Description |
|---------|-------------|
| **Entity** | Which entity to read from. Defaults to the block's configured entity. Can be overridden with a specific entity ID. |
| **Slot** | Alternatively, use an entity slot as the source. |
| **Source** | What to read: `state` (the entity's main state) or a specific attribute name. |

### Binding Modes

There are **5 binding modes** that determine how the entity value is transformed into a style value:

#### Direct

Uses the entity value directly, optionally with range mapping.

| Setting | Description |
|---------|-------------|
| **Input Range** | Optional min/max of the expected entity values |
| **Output Range** | Optional min/max of the desired output values |

**Example:** Map a light's brightness (0–255) to opacity (0–1):
- Input Range: `[0, 255]`
- Output Range: `[0, 1]`

#### Map

Maps specific entity state values to specific output values.

| Setting | Description |
|---------|-------------|
| **Map entries** | Key-value pairs: entity state → output value |

**Example:** Map entity state to colors:
- `on` → `#4CAF50` (green)
- `off` → `#9E9E9E` (gray)
- `unavailable` → `#F44336` (red)

#### Threshold

Uses numeric ranges to determine the output value.

| Setting | Description |
|---------|-------------|
| **Thresholds** | List of min/max ranges, each with an output value |

**Example:** Color-code a temperature sensor:
- 0–18°C → `#2196F3` (blue / cold)
- 18–24°C → `#4CAF50` (green / comfortable)
- 24–40°C → `#F44336` (red / hot)

#### Condition

Uses logical conditions with comparison operators. Conditions are evaluated in order — the first match wins.

| Setting | Description |
|---------|-------------|
| **Conditions** | List of condition cases, each with rules and an output value |

Each condition rule supports:

| Operator | Description |
|----------|-------------|
| `==` | Equal to |
| `!=` | Not equal to |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal |
| `<=` | Less than or equal |
| `contains` | String contains |
| `in` | Value is in list |

Condition rules can be combined with **AND** / **OR** logical operators, and can check multiple entities and attributes within the same binding.

**Example:** Show a red border when temperature is high AND humidity is above 70%:
- Condition: `AND`
  - `sensor.temperature` state `>` 30
  - `sensor.humidity` state `>` 70
- Value: `2px solid red`

#### Template

Uses a template string with `{{ }}` placeholders to construct the output value.

| Setting | Description |
|---------|-------------|
| **Template** | A string with placeholders that reference entity values |

**Example:** Dynamic background gradient:
- Template: `linear-gradient(to right, hsl({{ state }}, 80%, 50%), transparent)`

### Default Value

All binding modes support a **default value** — the value used when the entity is unavailable or the binding cannot be resolved.

---

**Next:** [Actions Panel →](panel-actions.md)
