# Card Builder – The Only Card You'll Ever Need!
The definitive Home Assistant card for your every idea. This project provides a powerful engine to build and render complex, dynamic UI layouts directly in your dashboard.

> [!WARNING] 
> 
> **PROJECT STATUS DEVELOPMENT: ALPHA** 
> 
> This project is under active development. 
> It is not stable, likely contains bugs, and might fail to work as expected. 
> 
> Use it at your own risk and expect breaking changes in future updates.

<p float="left">
  <img src="https://github.com/studiobts/home-assistant-card-builder/blob/main/assets/images/card_builder_designer_example.png?raw=true" width="80%" />
</p>

## Features

### Advanced Drag-and-Drop Builder
Build your interface visually. Move blocks around with a fluid drag-and-drop system and organize your layout exactly as you imagined it.

### Modular Block System

The card is composed of individual blocks that can be nested, moved, and customized to create anything from simple status cards to complex control centers.

### Dedicated Configuration Panels

**Properties Panel**: Edit the core data and behavior of each block.
**Styles Panel**: Full control over the look and feel, including colors, spacing, borders, and more.

## Dynamic State Binding
Go beyond static values. Both properties and styles can be dynamically bound to the state of your Home Assistant entities. 

Want a block to turn red when a sensor exceeds a threshold or change its text based on an entity's state? It’s all possible through the binding engine.

<p float="left">
  <img src="https://github.com/studiobts/home-assistant-card-builder/blob/main/assets/images/card_builder_dashboard_example.png?raw=true" width="80%" />
</p>

## Installation

#### Method 1: HACS (Recommended)

1. Open HACS (Home Assistant Community Store)
2. Add a new **Custom Repository** with type **Integration**
   ``` 
   https://github.com/studiobts/home-assistant-card-builder
   ```
3. Search "Card Builder"
4. Restart Home Assistant
5. Add the integration through the UI

#### Method 2: Manual Installation

1. Download this repository
2. Copy the `card_builder` folder to your Home Assistant's `custom_components` directory:
   ```
   /config/custom_components/card_builder/
   ```
3. Restart Home Assistant
4. Add the integration through the UI

## ⚠️ Current Limitations
Visual-only mode: At this stage, the builder is focused on data visualization.

Action blocks (buttons, toggles, scripts) are not yet implemented.

Interactions such as clicking to call services are currently unavailable.

## Roadmap
> Note: execution order and priorities are not yet defined — items listed below are goals under consideration.

- **Configurable actions for each block (tap / double tap / hold)**: Allow users to assign different interactions to individual blocks so the same block can perform different behaviors depending on the gesture. This enables richer, context-sensitive control and automation triggers.

- **Action-specific blocks (button, slider, etc.)**: Provide dedicated interactive blocks designed for common controls (buttons, sliders, toggles) to simplify building control-oriented UIs and ensure consistent behavior.

- **Domain-specific blocks (light, fan, switch, etc.)**: Offer pre-configured blocks tailored to Home Assistant domains so entity-specific controls, states, and actions are handled with minimal setup and proper UX.

- **Export of created card(s) for sharing**: Enable exporting one or multiple cards as sharable artifacts (JSON), making it easy to share configurations or move them between systems.

- **Save and reuse sets of preconfigured blocks as templates**: Allow users to save a selection of blocks as a reusable template or snippet to speed up assembly of common layouts and patterns.

- **History (undo/redo) for any modification**: Implement a reliable undo/redo system so users can confidently experiment and revert changes at any granularity.

- **Cloud backup of save history for quick restore and backup**: Offer optional cloud storage for save history to support recovery from accidental deletion, and automatic backups.

- **Marketplace for sharing and downloading ready-made cards/templates**: Create a discoverable marketplace where members can publish and download templates.

- **Internal AI agent for automated card generation**: Integrate an internal assistant/agent to help generate or suggest card layouts and templates automatically from high-level prompts or entity lists.

