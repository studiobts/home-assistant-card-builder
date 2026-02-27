# Panel Overview

Card Builder adds a dedicated panel to the Home Assistant sidebar. This panel is your central hub for managing and designing cards.

<!-- screenshot: panel-sidebar-entry — The Home Assistant sidebar showing the "Card Builder" entry -->

## Navigation

The panel has three main views, accessible through a simple navigation flow:

```
Dashboard  →  Cards List  →  Editor (Create / Edit)
```

You can always navigate back using the back button or breadcrumb links.

---

## Dashboard

The **Dashboard** is the landing page you see when opening Card Builder. It gives you a quick overview of your workspace.

<!-- screenshot: dashboard-view — The dashboard view showing statistics cards and quick action buttons -->

### Statistics

At the top, summary cards show key metrics at a glance:

- **Total Cards** — How many cards you've created
- **Last Updated** — When you last modified a card
- **Recent Activity** — Quick summary of recent changes

### Quick Actions

Below the statistics, a grid of action buttons provides fast access to common tasks:

- **Create New Card** — Jump directly into the editor with a blank canvas
- **View All Cards** — Navigate to the full cards list
- **Import Card** — Import a card from a JSON file

---

## Cards List

The **Cards List** view is a full management table for all your cards.

<!-- screenshot: cards-list-view — The cards list showing a table of cards with search bar, sort controls, and action buttons -->

### Header Actions

- **Create New Card** — Opens the editor with a blank canvas
- **Import Card** — Import a card configuration from a JSON file

### Search and Filters

A filter bar at the top of the list lets you:

- **Search** by card name
- **Sort** cards by name, creation date, or last update date
- **Change sort order** (ascending / descending)

### Card Table

Each card is displayed as a row showing:

- **Card name**
- **Creation date**
- **Last update date**
- **Actions** — Edit, Duplicate, Delete

### Pagination

When you have many cards, the list is paginated with navigation controls at the bottom.

### Card Actions

For each card in the list, you can:

| Action | Description |
|--------|-------------|
| **Edit** | Opens the card in the builder editor |
| **Duplicate** | Creates a copy of the card with a new name |
| **Delete** | Removes the card permanently (with confirmation) |

---

## Editor

The **Editor** view is a wrapper around the full builder interface. It manages loading and saving card data.

<!-- screenshot: editor-view — The editor view with the top bar showing card name input, save button, and the builder below -->

### Editor Header

The editor header sits above the builder and contains:

- **Back Button** — Returns to the cards list
- **Card Name** — An editable text field for the card name. The border changes color when there are unsaved modifications.
- **Save Button** — Persists the current card design. Shows visual feedback when saving is in progress.

### Creating a New Card

When you create a new card, the editor opens with an empty canvas and a default card name. You can start dragging blocks immediately.

### Editing an Existing Card

When you edit a card, the editor loads the saved card configuration into the builder. All blocks, styles, entity bindings, and slots are restored exactly as you left them.

### Auto-Update

When you save a card, any dashboard that uses that card via the Card Renderer will automatically pick up the changes — no need to manually refresh or reconfigure anything.

---

**Next:** [Builder Overview →](builder-overview.md)

