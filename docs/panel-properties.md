# Properties Panel

The Properties panel lets you configure the data and behavior of the currently selected block. It is located in the **right sidebar**, accessible via the **Properties** tab.

When no block is selected, the panel shows a placeholder message prompting you to select an element.

<!-- screenshot: panel-properties — The properties panel showing a selected Entity State block with block metadata, entity configuration, and formatting options -->

## Block Metadata

At the top of the panel, you'll find general information and settings that apply to every block:

| Field | Description |
|-------|-------------|
| **Type** | The block type (read-only). Displays "Card" for the root block. |
| **Block Name** | An optional user-defined label for the block. This name appears in the [Layers Panel](panel-layers.md) tree. |
| **Block ID** | A unique identifier for the block. Auto-generated, but can be changed. Useful for referencing blocks. |

---

## Entity Configuration

Below the metadata section, every block displays its **entity configuration**. This is one of the most important concepts in Card Builder — it determines how blocks connect to Home Assistant entities.

<!-- screenshot: panel-properties-entity-config — The entity configuration section showing the three modes (Inherited, Slot, Fixed) with the Inherited mode selected and showing the resolved entity -->

### Entity Modes

Every block has an entity mode that determines where it gets its entity from:

| Mode | Description |
|------|-------------|
| **Inherited** | The block uses the entity of its nearest parent that has one configured. This is the default mode. |
| **Slot** | The block uses an entity slot — a named placeholder that is filled in when the card is placed in a dashboard. |
| **Fixed** | The block uses a specific entity ID that is hardcoded and never changes. |

### Entity Inheritance

Inheritance is the default and most powerful mode. It works like CSS inheritance — you set a value at a parent level and it flows down to all descendants:

```
Card (entity: sensor.temperature)
  └── Container
        ├── Entity Name    → inherits sensor.temperature
        ├── Entity State   → inherits sensor.temperature  
        └── Entity Icon    → inherits sensor.temperature
```

In this example, you only need to configure the entity once on the Card. All child blocks automatically use it. If you set a different entity on the Container, its children would use that one instead.

This is especially powerful for **entity blocks** (State, Name, Icon, Attribute, Image) which **require** an entity — with inheritance, they work immediately without any per-block configuration.

### Fixed Entity

When a block has its entity mode set to **Fixed**, it uses a specific entity ID regardless of parent configuration. This is useful when you want a particular block to always show data from a specific entity, even if the card is used as a template.

Use the entity picker to select the entity.

### Entity Slots

**Slots** are the mechanism that turns your cards into reusable templates. Instead of hardcoding an entity, you assign a slot — a named placeholder. When the card is placed in a dashboard, the user picks which entity fills each slot.

**Example workflow:**

1. In the builder, create a card with an Entity State block
2. Set the block's entity mode to **Slot** and select a slot named "Main Sensor"
3. Save the card
4. In the dashboard, add the card using the Card Renderer
5. In the card editor, you'll see a "Main Sensor" dropdown — pick `sensor.living_room_temperature`
6. Place the same card again elsewhere — this time pick `sensor.bedroom_temperature`

Both card instances share the same design, but each shows data from a different entity. If you update the design in the builder, both instances update automatically.

#### Managing Entity Slots

Entity slots are managed at the **card level** through the Entity Slots Manager, accessible by clicking the **Entities** button in the [builder header](builder-overview.md#header-bar).

<!-- screenshot: entity-slots-manager — The entity slots manager overlay showing a list of defined slots with name, description, domain filter, and assigned references -->

In the Entity Slots Manager, you can:

| Action | Description |
|--------|-------------|
| **Add Slot** | Create a new entity slot with a name and optional description |
| **Edit Slot** | Change the slot name, description, or domain filter |
| **Delete Slot** | Remove a slot (blocks using it will show a missing reference) |
| **Set Domain Filter** | Restrict which entity domains are allowed for this slot |
| **Preview Slot** | Set a preview entity for the slot to see how the card looks during design |
| **View References** | See which blocks in the card are using this slot |

---

## Block Properties

Below the entity configuration, blocks expose their own **configurable properties** organized into collapsible groups.

Each property has a specific input type based on what it controls:

| Input Type | Description |
|------------|-------------|
| **Text** | Free text input, optionally with template support |
| **Number** | Numeric input with optional min/max/step constraints |
| **Checkbox** | Boolean toggle (on/off) |
| **Select** | Dropdown with predefined options |
| **Textarea** | Multi-line text input, used for templates |
| **Color** | Color picker |
| **Icon Picker** | MDI icon picker (e.g., `mdi:lightbulb`) |
| **Entity Picker** | Home Assistant entity selector |
| **Attribute Picker** | Entity attribute selector with autocomplete |
| **Action Button** | Opens a dedicated editor (e.g., Grid Editor for Grid blocks) |

### Conditional Visibility

Some properties are only shown when relevant — their visibility depends on the values of other properties. For example:

- The **Precision** field only appears when **Format** is set to "Numeric" or "Integer"
- The **Date Format** field only appears when **Format** is set to "Date/Time"
- The **Inline Placement** option only appears when **Value Position** is "Inline"

This keeps the interface clean by only showing properties that matter for the current configuration.

### Property Binding

Many properties support **dynamic binding** to entity state. When a property has a binding button (🔗), you can click it to open the binding editor and connect the property's value to live entity data.

For details on how bindings work, see [Style Bindings](panel-styles.md#style-bindings) — the same binding system is used for both style properties and block properties.

### Template Support

Some text-based properties support **Jinja2-style templates** with special keywords:

| Keyword | Description |
|---------|-------------|
| `{{ state }}` | The entity's current state value |
| `{{ name }}` | The entity's friendly name |
| `{{ entity_id }}` | The entity's full ID |
| `{{ value }}` | The formatted value (context-dependent) |

For example, the Entity Name block's **Custom Name** property could be set to: `Room: {{ name }}` to prefix the entity name with "Room: ".

---

**Next:** [Styles Panel →](panel-styles.md)

