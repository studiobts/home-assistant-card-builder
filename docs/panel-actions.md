# Actions Panel

The Actions panel lets you assign interactive behaviors to blocks. When your card is rendered in a dashboard, users can tap, double tap, or hold blocks to trigger actions like toggling entities, calling services, navigating to other views, and more.

It is located in the **right sidebar**, accessible via the **Actions** tab.

When no block is selected, the panel shows a placeholder message.

<!-- screenshot: panel-actions-overview — The actions panel showing a selected block with the target selector, an assigned action slot showing "Tap • Toggle", and the "Add Action" button -->

## How Actions Work

Actions in Card Builder follow a **slot-based system** — similar to how entity slots work for entity bindings. This two-level approach keeps your cards reusable and configurable:

1. **Action Slots** are defined at the card level — each slot specifies a trigger, an action type, and its parameters
2. **Blocks** reference one or more action slots, assigning them to specific **action targets**

When the card is placed in a dashboard, action slots can be reconfigured per instance, just like entity slots.

---

## Action Targets

Just like [style targets](panel-styles.md#style-targets), blocks can have multiple **action targets** — parts of the block that independently respond to user interaction.

When a block has multiple action targets, a **target selector** appears at the top of the Actions panel:

| Target | Description |
|--------|-------------|
| **Block** | The block's main area — available on most blocks by default |
| **Custom targets** | Sub-component targets defined by the block type |

**Examples of custom action targets:**

- **Entity State**: "State" (value element) and "Unit" (unit element)
- **Entity Attribute**: "Label" and "Value"
- **Slider**: "Value" (the value label) — the slider itself handles drag interaction natively

> **Note:** Some blocks (like the Slider) do not expose a block-level action target because they handle interaction natively through their own controls.

---

## Action Slots

Action slots are the building blocks of the action system. Each slot defines:

| Field | Description |
|-------|-------------|
| **Name** | A descriptive name for the slot (e.g., "Toggle Light", "Open Camera") |
| **Description** | Optional description of what the action does |
| **Trigger** | When the action fires: **Tap**, **Double Tap**, or **Hold** |
| **Action** | What happens when triggered (see [Action Types](#action-types)) |

### Managing Action Slots

Action slots are managed at the **card level** through the Action Slots Manager, accessible by clicking the **Actions** button in the [builder header](builder-overview.md#header-bar).

<!-- screenshot: action-slots-manager — The action slots manager overlay showing defined action slots with trigger, action type, and service details -->

In the Action Slots Manager, you can:

| Action | Description |
|--------|-------------|
| **Add Slot** | Create a new action slot with trigger and action configuration |
| **Edit Slot** | Modify the trigger, action type, or parameters |
| **Delete Slot** | Remove a slot (blocks referencing it will show a warning) |
| **View References** | See which blocks and targets are using this slot |

---

## Action Types

The following action types are available when configuring an action slot:

| Action Type | Description |
|-------------|-------------|
| **None** | No action — explicitly disables the trigger |
| **Toggle** | Toggles the entity on/off |
| **More Info** | Opens the Home Assistant "More Info" dialog for the entity |
| **Perform Action** | Calls a Home Assistant service (e.g., `light.turn_on`) with optional data and target |
| **Navigate** | Navigates to a specified path within Home Assistant |
| **Open URL** | Opens an external URL |
| **Fire Event** | Fires a custom DOM event |

### Perform Action

The most powerful action type. It lets you call any Home Assistant service with full control:

| Setting | Description |
|---------|-------------|
| **Service** | The service to call (e.g., `light.turn_on`, `script.my_script`) |
| **Data** | Additional service data as key-value pairs |
| **Target** | Target entity, device, or area for the service call |

---

## Assigning Actions to Blocks

To assign an action to a block:

1. Select the block on the canvas or in the layers tree
2. Open the **Actions** tab in the right sidebar
3. If the block has multiple action targets, select the desired target
4. Click **+ Add Action**
5. Select an action slot from the dropdown

You can assign **multiple action slots** to the same target — each with a different trigger. For example:

- **Tap** → Toggle the light
- **Double Tap** → Open More Info dialog
- **Hold** → Navigate to the light's control page

### Removing Actions

Each assigned action shows a summary card with a delete button. Click it to remove the action from the target.

---

## Action Triggers

| Trigger | Description |
|---------|-------------|
| **Tap** | A quick single tap/click on the element |
| **Double Tap** | Two quick successive taps within a short interval |
| **Hold** | Press and hold the element for about 1 second |

When the **Actions Toggle** is enabled in the [builder header](builder-overview.md#header-bar), you can test action triggers directly in the builder canvas without switching to the dashboard.

---

## Reusability with Dashboard Configuration

When your card is used in a dashboard via the [Card Renderer](card-renderer.md), action slots can be **reconfigured per card instance**. This means:

- You define the action structure (which blocks respond to which triggers) in the builder
- The dashboard user can customize what those actions actually do for each card instance
- Different instances of the same card can perform different actions

For example, a "Room Control" card template might have a "Toggle Main Light" action slot. In the living room dashboard, it could be connected to `light.living_room`, while in the bedroom it connects to `light.bedroom` — all from the same card design.

---

**Next:** [Card Renderer →](card-renderer.md)

