import { log } from './logging';
import { canvasElement } from './elements';
import {
  drawHighlightBox,
  drawTagAnnotation,
  drawTagBox,
} from './canvas.render';
import { delay } from './utils';
import {
  createNextDefaultTagAnnotation,
  updateTagsInTaggedImage,
} from './tags.helpers';
import { drawTaggedImageFromCache } from './canvas.render.cache';
import {
  mouseButtonIsUp,
  mouseMouseDurationExceedsRejectionThreshold,
  resetMouseMoveTracking,
  resetSelectionTracking,
  selectionCoordinates,
  selectionDeltaExceedsRejectionThreshold,
  updateMouseButtonIsDown,
  updateMouseButtonIsUp,
  updateMouseMoveHasBegun,
  updateMouseMoveHasStopped,
  updateSelectionEnd,
  updateSelectionStart,
} from './canvas.actions.cache';

function handleMouseDown(event: MouseEvent): void {
  log(handleMouseDown.name);

  updateMouseButtonIsDown();

  // NOTE: This provides the start coordinates for highlight box and tag box
  updateSelectionStart(event);
}

async function handleMouseUp(event: MouseEvent): Promise<void> {
  log(handleMouseUp.name);

  updateMouseButtonIsUp();
  updateMouseMoveHasStopped();

  if (
    !mouseMouseDurationExceedsRejectionThreshold() ||
    !selectionDeltaExceedsRejectionThreshold()
  ) {
    drawTaggedImageFromCache();
    resetSelectionTracking();
    resetMouseMoveTracking();
    return;
  }

  resetMouseMoveTracking();

  // NOTE: This provides the end coordinates for highlight box and tag box
  updateSelectionEnd(event);

  // NOTE: Deliberately draw over existing highlight box to indicate to user the selected area is confirmed
  drawHighlightBox(selectionCoordinates());

  // NOTE: Deliberate delay before showing prompt for user to inspect what was just selected
  await delay(500);
  const replyOrNoReply = window.prompt(
    'Annotate this tag (you may leave it empty)'
  );

  // NOTE: Redraw from scratch to remove highlight box entirely
  drawTaggedImageFromCache();

  // NOTE: Do not draw tag image if user pressed "Cancel"
  if (Object.is(replyOrNoReply, null)) return;

  // NOTE: We can safely cast it as string at this point
  const reply = replyOrNoReply as string;

  // NOTE: Save new tag to database and re-render
  await updateTagsInTaggedImage((tags) => {
    // NOTE: If `reply` is empty string, create a default tag annotation
    const text = reply ? reply : createNextDefaultTagAnnotation(tags);

    const box = drawTagBox(selectionCoordinates());
    const annotation = drawTagAnnotation(selectionCoordinates(), text);

    return [
      ...tags,
      {
        annotation: {
          text,
          x: annotation.x,
          y: annotation.y,
        },
        box: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        },
      },
    ];
  });

  // NOTE: reset selection coordinate
  resetSelectionTracking();
}

function handleMouseMove(event: MouseEvent): void {
  log(handleMouseMove.name);

  // NOTE: Stop if mouse button is not pressed and held
  if (mouseButtonIsUp()) return;

  updateMouseMoveHasBegun();

  // NOTE: Keep updating this on mouse move to create highlight box
  // NOTE: Final update provides end coordinates to draw the tag box
  updateSelectionEnd(event);

  // NOTE: This animates the drawing of the highlight box
  window.requestAnimationFrame(() => {
    drawTaggedImageFromCache();
    drawHighlightBox(selectionCoordinates());
  });
}

export function addCanvasRelatedEventListeners(): void {
  log(addCanvasRelatedEventListeners.name);

  canvasElement.addEventListener('mousedown', handleMouseDown);
  canvasElement.addEventListener('mousemove', handleMouseMove);
  canvasElement.addEventListener('mouseup', handleMouseUp);
}
