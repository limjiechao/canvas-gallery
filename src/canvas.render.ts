import { log } from './logging';
import { canvasElement } from './elements';
import { createImageFromSource } from './utils';
import {
  CanvasParameters,
  Coordinates,
  DraftTaggedImage,
  TaggedImage,
  TaggedImages,
} from './indexed.db';
import { RenderParameters } from './main';

const contextId = '2d' as const;

export function getCanvas2dContext() {
  log(getCanvas2dContext.name);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return canvasElement.getContext && canvasElement.getContext(contextId)!;
}

function drawImage(
  image: HTMLImageElement,
  { width, height, x, y }: CanvasParameters
) {
  log(drawImage.name);
  const context = getCanvas2dContext();
  context.drawImage(image, x, y, width, height);
}

export async function drawTaggedImage(
  taggedImage: TaggedImage | DraftTaggedImage,
  createdImage?: HTMLImageElement
) {
  log(drawTaggedImage.name);
  const {
    image: { dataUrl, x, y, height, width },
    tags,
  } = taggedImage;
  const image = await (createdImage
    ? Promise.resolve(createdImage)
    : createImageFromSource(dataUrl));

  drawImage(image, { x, y, height, width });

  // TODO: Redraw tags
  tags.forEach((tag) => {
    //
  });
}

export interface PointerCoordinates {
  start: Coordinates;
  end: Coordinates;
}

export function selectAreaInCanvas(): Promise<PointerCoordinates> {
  // On mouse down, `drawHighlightBox(…)` --> startCoordinates = endCoordinates
  // On mouse move, `drawHighlightBox(…)` --> update endCoordinates
  // On mouse up, clear highlight box, draw tag box, and prompt for annotation --> final endCoordinates

  return Promise.resolve({
    start: {
      x: 0,
      y: 0,
    },
    end: {
      x: 0,
      y: 0,
    },
  });
}

/**
 * selectAreaInCanvas()
 *   .then(() => Promise.all([
 *     drawTagBox(),
 *     promptTextAnnotation()
 *   ])
 *   .then(() => Promise.all([
 *     drawTagAnnotation(),
 *     updateImageInDatabase()
 *   ])
 * */

type AxisScale = 'xScale' | 'yScale';
type AxisScales = Record<AxisScale, number>;

export function computeAxisScales(): AxisScales {
  const absoluteWidth = canvasElement.width;
  const absoluteHeight = canvasElement.height;

  const scaledWidth = canvasElement.offsetWidth;
  const scaledHeight = canvasElement.offsetHeight;

  const xScale = absoluteWidth / scaledWidth;
  const yScale = absoluteHeight / scaledHeight;

  return { xScale, yScale };
}

export function computePath(
  { xScale, yScale }: AxisScales,
  { start, end }: PointerCoordinates
): CanvasParameters {
  const x = start.x * xScale;
  const y = start.y * yScale;
  const width = (end.x - start.x) * xScale;
  const height = (end.y - start.y) * yScale;

  return { x, y, width, height };
}

export function drawBox(pointerCoordinates: PointerCoordinates) {
  const axisScales = computeAxisScales();
  const { x, y, width, height } = computePath(axisScales, pointerCoordinates);

  const context = getCanvas2dContext();
  context.beginPath();
  context.rect(x, y, width, height);
  context.strokeStyle = '#aaaaaa';
  context.closePath();
}

// TODO:
export function drawHighlightBox(pointerCoordinates: PointerCoordinates) {
  //
  const axisScales = computeAxisScales();
  const { x, y, width, height } = computePath(axisScales, pointerCoordinates);

  const context = getCanvas2dContext();
  context.beginPath();
  context.rect(x, y, width, height);
  context.strokeStyle = '#aaaaaa';
  context.fillStyle = '#FF0000';
  context.fill();
  context.closePath();
}

// TODO:
export function drawTagBox(
  pointerCoordinates: PointerCoordinates,
  text: string
) {
  const axisScales = computeAxisScales();
  const { x, y, width, height } = computePath(axisScales, pointerCoordinates);

  const context = getCanvas2dContext();
  context.beginPath();
  context.rect(x, y, width, height);
  context.strokeStyle = '#aaaaaa';
  context.font = '48px sans-serif';
  context.fillStyle = '#aaaaaa';
  context.fillText(text, x, y + 48 * axisScales.yScale);
  context.stroke();
  context.closePath();
}

export function drawTagAnnotation(
  pointerCoordinates: PointerCoordinates,
  text: string
) {
  const axisScales = computeAxisScales();
  const { x, y } = computePath(axisScales, pointerCoordinates);
  const context = getCanvas2dContext();
  context.strokeStyle = '#aaaaaa';
  context.font = '48px sans-serif';
  context.fillStyle = '#aaaaaa';
  context.fillText(text, x, y + 48 * axisScales.yScale);
}

// TODO:
export function drawTag(pointerCoordinates: PointerCoordinates, text: string) {
  drawTagBox(pointerCoordinates, text);
  // TODO: Prompt for text
  // TODO: Draw text within tag box
  // TODO: Add tag to tagged image and save to database
}

export function setCanvasAbsoluteDimensions(window: Window): void {
  log(setCanvasAbsoluteDimensions.name);
  const availHeight = window.screen.availHeight;
  const availWidth = window.screen.availWidth;
  const length = availHeight >= availWidth ? availHeight : availWidth;

  canvasElement.height = length;
  canvasElement.width = length;
}

export function clearCanvas() {
  const context = getCanvas2dContext();
  context.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

export async function renderCanvas(
  {
    computedConditions: { noIndex, noImages },
    computedData: { currentImageIndex, defaultImageIndex },
  }: RenderParameters,
  taggedImages: TaggedImages
): Promise<void> {
  if (noImages) {
    clearCanvas();
  } else {
    const image: TaggedImage =
      taggedImages[noIndex ? defaultImageIndex : currentImageIndex];

    await drawTaggedImage(image);
  }
}
