import { Coordinates } from './indexed.db';
import { log } from './logging';
import { canvasElement } from './elements';
import {
  drawHighlightBox,
  drawTagAnnotation,
  drawTagBox,
  redrawImage,
  SelectionCoordinates,
} from './canvas.render';
import { delay } from './utils';
import { clearCanvas } from './canvas.helpers';

type MouseButtonState = 'up' | 'down';

const mouseButton = {
  _state: 'up' as MouseButtonState,
  get isDown(): boolean {
    return this._state === 'down';
  },
  get isUp(): boolean {
    return this._state === 'up';
  },
  set state(upOrDown: MouseButtonState) {
    this._state = upOrDown;
  },
};

const selection = {
  _start: { x: 0, y: 0 } as Coordinates,
  _end: { x: 0, y: 0 } as Coordinates,
  set start({ x, y }: Coordinates) {
    this._start.x = x;
    this._start.y = y;
  },
  set end({ x, y }: Coordinates) {
    this._end.x = x;
    this._end.y = y;
  },
  get coordinates(): SelectionCoordinates {
    return {
      start: this._start,
      end: this._end,
    };
  },
};

function handleMouseDown(event: MouseEvent): void {
  log(handleMouseDown.name);

  mouseButton.state = 'down';

  // NOTE: This provides the start coordinates for highlight box and tag box
  selection.start = { x: event.offsetX, y: event.offsetY };
}

async function handleMouseUp(): Promise<void> {
  log(handleMouseUp.name);

  mouseButton.state = 'up';

  // NOTE: Deliberately draw over existing highlight box to indicate to user the selected area is confirmed
  drawHighlightBox(selection.coordinates);

  // NOTE: Deliberate delay before showing prompt for user to inspect what was just selected
  await delay(500);
  const text = window.prompt('Annotate this tag') ?? '';

  // NOTE: Redraw from scratch to remove highlight box entirely
  clearCanvas();
  redrawImage();

  // NOTE: Do not draw tag image if no annotation was given
  if (!text) return;

  drawTagBox(selection.coordinates);
  drawTagAnnotation(selection.coordinates, text);

  // TODO: Save to database
}

function handleMouseMove(event: MouseEvent): void {
  log(handleMouseMove.name);

  // NOTE: Stop if mouse button is not pressed and held
  if (mouseButton.isUp) return;

  // NOTE: Keep updating this on mouse move to create highlight box
  // NOTE: Final update provides end coordinates to draw the tag box
  selection.end = { x: event.offsetX, y: event.offsetY };

  // NOTE: This animates the drawing of the highlight box
  window.requestAnimationFrame(() => {
    clearCanvas();
    redrawImage();
    drawHighlightBox(selection.coordinates);
  });
}

export function addCanvasRelatedEventListeners(): void {
  log(addCanvasRelatedEventListeners.name);

  canvasElement.addEventListener('mousedown', handleMouseDown);
  canvasElement.addEventListener('mousemove', handleMouseMove);
  canvasElement.addEventListener('mouseup', handleMouseUp);
}
