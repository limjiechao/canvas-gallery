import { Coordinates } from './indexed.db';
import { log } from './logging';
import { canvasElement } from './elements';
import { drawTag } from './canvas.render';

const start: Coordinates = { x: 0, y: 0 };
const end: Coordinates = { x: 0, y: 0 };

function handleMouseDown(event: MouseEvent) {
  log(handleMouseDown.name);
  start.x = event.offsetX;
  start.y = event.offsetY;
}

function handleMouseUp() {
  log(handleMouseUp.name);
  const text = window.prompt('Enter tag') ?? 'Hello world';
  console.log({ text });
  drawTag({ start, end }, text);
}

function handleMouseMove(event: MouseEvent) {
  log(handleMouseMove.name);
  end.x = event.offsetX;
  end.y = event.offsetY;
}

export function addCanvasRelatedEventListeners(): void {
  log(addCanvasRelatedEventListeners.name);

  canvasElement.addEventListener('mousedown', handleMouseDown);
  canvasElement.addEventListener('mousemove', handleMouseMove);
  canvasElement.addEventListener('mouseup', handleMouseUp);
}
