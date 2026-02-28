# Media Manager

The Media Manager is a built-in file management tool that lets you upload, browse, and select images directly within Card Builder — without leaving the editor. It stores files in a dedicated folder inside your Home Assistant `www` directory (`/local/card_builder/`), making them immediately available as local assets for your cards.

<!-- screenshot: media-manager-overview — The Media Manager overlay showing the toolbar with Upload and Refresh buttons, a search input, breadcrumb navigation, the drag-and-drop zone, and a grid of image thumbnails -->

## Accessing the Media Manager

The Media Manager can be opened in two modes depending on the context:

| Context | How to Open | Mode |
|---------|-------------|------|
| **Header Bar** | Click the **Media** button in the left section of the builder header bar | Manage mode |
| **Image Block** | In the [Image block](panel-blocks.md#image) Properties panel, set **Image Source** to "Media Library" and click **Select media** | Selection mode |
| **Background Image** | In any block's [Styles panel](panel-styles.md#background), click the media picker button next to **Background Image** | Selection mode |

In **manage mode** (opened from the header bar), the overlay provides a Close button in the footer — you can upload, browse, delete, and organize files without needing to confirm a selection.

In **selection mode** (opened from a block property), the overlay includes a footer with a **"Use selected media"** confirmation button. Once confirmed, the selected media reference is applied to the property that triggered the overlay and the dialog closes automatically.

---

## Toolbar

The toolbar at the top of the Media Manager provides the main actions:

| Control | Description |
|---------|-------------|
| **Upload** | Opens a file picker to select one or more files from your computer |
| **Refresh** | Reloads the current folder contents |
| **Search** | Filters the displayed items by name |

---

## Uploading Files

There are two ways to upload files:

### Upload Button

1. Click **Upload** in the toolbar
2. Select one or more files in the file picker
3. Files are uploaded to the **current folder**

### Drag and Drop

1. Drag files from your computer
2. Drop them onto the **drop zone** area ("Drag files here to upload or use the Upload button")
3. Files are uploaded to the **current folder**

During upload, a progress indicator shows how many files have been processed (e.g., "Uploading 2/5").

When in **selection mode**, the last uploaded file is automatically pre-selected so you can confirm immediately without having to click on it in the grid.

<!-- screenshot: media-manager-upload — The Media Manager showing the drop zone highlighted during a drag operation, with the upload progress indicator visible -->

> **Storage location:** All uploaded files are stored under `config/www/card_builder/` in your Home Assistant installation. They are served as local assets at the URL path `/local/card_builder/`.

---

## Browsing

The Media Manager displays files and folders in a **grid layout** with thumbnail previews for images.

### Navigation

- Click on a **folder** to navigate into it
- Use the **breadcrumb bar** at the top to navigate back to any parent folder
- The root is always labeled "Card Builder"

### Folder Structure

You can organize your media into subfolders. The breadcrumb trail updates as you navigate deeper:

```
Card Builder / backgrounds / living-room
```

### File Grid

Each file in the grid shows:

- A **thumbnail** preview (for images) or a folder icon
- The **file name** below the thumbnail
- On hover: a **delete button** (trash icon) in the top-right corner

<!-- screenshot: media-manager-grid — The file grid showing several image thumbnails with names, one being hovered with the delete button visible -->

---

## Selecting Media

When the Media Manager is opened in **selection mode** (from a block property):

1. **Browse** to find the desired image
2. **Click** on the image thumbnail — it gets highlighted with an accent border
3. The **footer** shows the selected file name
4. Click **Use selected media** to confirm

The selected media reference is applied to the property that triggered the overlay. The overlay closes automatically after confirmation.

If you upload a new file while in selection mode, the newly uploaded file is automatically pre-selected.

---

## Preview Panel

When a file is selected, a **preview panel** appears alongside the file grid, splitting the content area into two columns:

| Element | Description |
|---------|-------------|
| **Preview image** | A large preview of the selected image, fitting within the panel |
| **File name** | The name of the selected file |
| **Content type** | The MIME type of the file (e.g., `image/png`, `image/jpeg`) |

<!-- screenshot: media-manager-preview — The Media Manager in split view with the file grid on the left and the preview panel on the right showing a large image preview with file name and content type -->

---

## Deleting Files

To delete a file:

1. Hover over the file thumbnail to reveal the **delete button** (trash icon)
2. Click the delete button
3. Confirm the deletion in the browser dialog

> **Note:** Deletion is permanent. Deleted files cannot be recovered. If a deleted image was in use by a block, that block will show a broken image placeholder.

---

## Where Media Is Used

The Media Manager integrates with these parts of Card Builder:

### Image Block — Media Library Source

In the [Image block](panel-blocks.md#image), when **Image Source** is set to "Media Library", a media picker appears with Select / Edit / Remove actions. Clicking Select or Edit opens the Media Manager overlay to pick an image.

### Background Image Style Property

In the [Styles panel](panel-styles.md#background), the **Background Image** property on any block supports media selection. Use the media picker button to open the Media Manager and select an image to use as a CSS background.

In both cases, the selected media is stored as an internal reference (`cb-media://local/card_builder/...`) that automatically resolves to the correct local URL when the card is rendered.

---

**Next:** [Builder Overview →](builder-overview.md)



