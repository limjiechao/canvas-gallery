# Technical Considerations

## Code organization

### `canvas.*.ts` , `image.*.ts`, `tags.*.ts`

App is conceived of as having 3 interactive parts:

- Canvas element,
- Image browser section
- Tags section

Each part consists of separate modules:

- `*.render.ts`  to handle rendering
- `*.helpers.ts` helper functions to handle second-order computations
- all other files handle the major user flows

Canvas element also has two `*.cache.ts` for:

- current image and tags at hand
- tracking mouse events and selection coordinates

### `main.ts`

- Initialization
- Centralized app rendering logic.

### `elements.ts`

HTML elements assigned to constants guaranteed to be available for use by the app upon `readystatechange`.

### `index.db.ts`

IndexDB service for:

- first-time and subsequent initializations, and
- CRUD for `taggedImages` store

## Functional programming

Not every function is pure in the strictest sense of absolutely no side effects. The following concerns by necessity
requires mutation:

- canvas caches,
- selection coordinates tracking
- DOM manipulation, and
- drawing of canvas

But for everything and everywhere else, *not a single variable in the app is mutated*. Instead, generous creation of
one-off temporary local variables and data transformations via non-mutative array methods.

## JavaScript modules

JavaScript modules gives the benefit of object-oriented programming such as bundling of related private states, private
functions with public functions to mutuate the states but in a free-form manner, without the straitjacket of a class.

## TypeScript

This allows every argument in every function to be tightly defined with the benefit of documentation and type checking
at compile time to avoid most footguns.

## One set of rendering logic to rule them all

The same `renderApp()` is always called after each database trip, which renders the whole app from scratch. While
arguably more expensive computationally, this vastly simplifies the task of coding as only one set of logic is needed
for the whole app to be completely and correctly rendered.

Computed data and conditions are crunched in a centralized `computeRenderParameters(…)` function and then shared by
separate rendering logic for each part of the app. This enables the app to be D.R.Y. and always have a single source of
truth.

## Initialization

- If touch device *without* a fine pointing peripheral is detected, show unsupported message and throw error to stop execution
- Set canvas absolute dimensions
- Add event listeners for
    - Image Section
        - “Upload New Image” button
        - “Delete Image” button
        - “Next” button
        - “Back” button
    - Tag Section
        - “Clear All Tags” button
    - Canvas interactions
        - Select area highlight
        - Draw tag box
- Initialize database if not found
- Fetch tagged images from database to render the app
- Initial render
    - Image Browser Section
        - Current image ID
        - Current image number
        - Total image count
    - Tags Section
        - Per tag
            - Annotation text
                - `click` event listener to edit annotation
            - Per-tag “Delete” button
                - `click` event listene to delete tag
    - Canvas
        - Image
        - Tags
            - Box
            - Annotation

# User Flows

## Draw new tag box

- Highlight selected area
- Prompt for annotation input
- Upon confirmation, saves to database and re-renders
- Disallow highlight box when not `mousedown`

## Upload New Image

- Set “Waiting for file picker…” label
- Restore to "Upload New Image” label
- Convert image to base-64 string
- Create HTML Image element from base-64 string for drawing onto canvas
- Compute image's centered coordinates and resized dimensions if found to be bigger than the canvas
- Draw image on canvas
- Saves to database and re-renders

## Previous Image & Next Image

- Image ID of previous and next image as set as dataset attributes on the image title element

## Delete Image

- Get image ID from `dataset-index’s set on image title
- Delete by tagged image ID from database
- Another tagged image is loaded during re-render

## Delete one tag

- Get image ID from `dataset-current-id`  set on image title element
- Get the position index of tag within tags array from `dataset-index`  tag element
- Update tagged image by ID from database
- Saves to database and re-renders

## Clear all tags

- Get image ID from `dataset-index` set on image title
- Update tagged image by ID from database
- Saves to database and re-renders

## Edit tag annotation

- Tag changes to look like input box when hovered over
- Upon clicking, prompt for annotation input appears
- Upon confirmation, saves to database and re-renders

# Storage

## Indexed DB

This is used to store images and tags so any number of images of any size can be used in the app. This is essential as
nowadays each image easily take up a few megabytes and local storage can only handle up to 5 MB.

There is just one `TaggedImages` store. Data structure is as follows:

```typescript
// From `index.db.ts`
export type ImageDataUrl = `data:image/${
  | 'jpeg'
  | 'png'
  | 'gif'};base64,${string}`;

type Axis = 'x' | 'y';
export type Coordinates = Record<Axis, CanvasParameterType>;

export type Dimension = 'height' | 'width';
export type Dimensions = Record<Dimension, CanvasParameterType>;

type CanvasParameter = Axis | Dimension;
export type CanvasParameterType = number;

export type CanvasParameters = Record<CanvasParameter, CanvasParameterType>;

export interface TagAnnotation extends Coordinates {
  text: string;
}

export type TagBox = CanvasParameters;

export interface Tag {
  annotation: TagAnnotation;
  box: TagBox;
}

interface Image extends CanvasParameters {
  dataUrl: ImageDataUrl;
}

export type Tags = Tag[];

export interface TaggedImage {
  id: number;
  image: Image;
  tags: Tags;
}
```

## Local Storage

This is used to save the ID of the last loaded image so it can be restored when launched or reload.

Every time a new image is deleted or loaded, this local storage item is updated.

## Caches

### Facilitate fast canvas redraws

The current image and its tags are cached to avoid any round trip to the database and allow fast redrawing of the canvas
during user interaction.

### Track mouse events and selection coordinates

Tracking across `mouseup`, `mousemove` and `mouseup` events to track:

- if mouse button is down or up,
- duration of mouse movement when mouse button is down, and
- start and end coordinates of the dragging

These facilitate the drawing of the timely and accurate selection box and tag box and rejection of accidental clicking
and dragging.

### Direct mutations only within `canvas.render.cache.ts` and `canvas.actions.cache.ts`

Each cache is a JavaScript object with getters and setters to facilitate mutations. All direct mutations happen
within `canvas.render.cache.ts`. All other JavaScript modules can only indirectly mutate the caches via exported
functions.

# Canvas responsiveness

- Canvas size is set to the higher of `window.screen.availHeight` or `window.screen.availWidth`
- Several breakpoints to maximize canvas size at all resolutions:
    - `768px`
    - `640px`
    - `512px`
- Interface arrangement goes from side-by-side to top-bottom as screen width shrinks
- If screen width falls below `375 px` width, app would show “screen size not supported” message

# UX Considerations

## General Affordances

When hovering over canvas, pointer changes to **crosshair** cursor to invite user to start dragging to tag.

When hovering over existing tags, pointer changes to **text** cursor and the tags changes style to look like input box
to invite users to click.

## When no image is loaded

- Canvas disabled from tagging and turns to darker grey
- Image back and next button disabled
- Clear all tags button disabled
- User is hinted to upload new image with the placeholder title “Upload image to start” and “No image” in the image
  browser

## When first image is loaded

The image automatically resizes to fit and is centered on the canvas.

## When drawing a new tag box

- As user clicks and drags, a blue translucent selection box is drawn
- Once user releases the click, blue translucent box darkens to confirm selection
- After a deliberate delay of 500ms to let user inspect what was selected, a browser prompt pops up for user to input
  the annotation

### Threshold for selection rejection

If selection box is smaller than 20px by 20px or dragging lasts shorter than 250 milliseconds, the selection will be
rejected.

This guard imposed to avoid accidental clicking and dragging from creating unwanted tags, reducing annoyances.

## When entering new tag annotation

### User presses Cancel

- No tag is drawn

### User presses Okay

#### If input is empty string

- An automatically incremented default “Untitled Tag Number X” annotation is given

#### If input is populated string

- Tag box is annotated with user input

## When editing existing tag

### User presses Cancel

- Reverts to old text

### User presses Okay

#### If input is empty string

- Reverts to automatically incremented default “Untitled Tag Number X”

#### If input is populated string

- And different from the old text
    - Updates to database, re-fetches and re-renders
- And same as old text
    - Skips database trips and re-render

## When deleting image

- If no saved image left, app disabled canvas from tagging
- If was last saved image, app switches to image before
- If was first saved image, app switches to second image
- Otherwise, app simply switches to the image before

