import { log } from './logging';
import {
  CanvasParameters,
  CanvasParameterType,
  Coordinates,
  TagAnnotation,
  TagBox,
  TaggedImage,
  TaggedImages,
} from './indexed.db';
import { RenderParameters } from './main';
import {
  clearCanvas,
  computeAxisScales,
  computeOrientation,
  computePath,
  computeTextPlacement,
  getCanvas2dContext,
} from './canvas.helpers';
import {
  drawTaggedImage,
  resetImageCache,
  resetTagsCache,
} from './canvas.cache';

// Rendering entire canvas

export async function renderCanvas(
  {
    computedConditions: { noIndex, noImages },
    computedData: { currentImageIndex, defaultImageIndex },
  }: RenderParameters,
  taggedImages: TaggedImages
): Promise<void> {
  log(renderCanvas.name);
  if (noImages) {
    resetImageCache();
    resetTagsCache();
    clearCanvas();
  } else {
    const image: TaggedImage =
      taggedImages[noIndex ? defaultImageIndex : currentImageIndex];

    await drawTaggedImage(image);
  }
}

// Rendering images

export function drawImage(
  image: HTMLImageElement,
  { width, height, x, y }: CanvasParameters
): void {
  log(drawImage.name);
  const context = getCanvas2dContext();
  context.drawImage(image, x, y, width, height);
}

// Rendering tags

const lightGrey = '#858585';
const blue = '#0099ff';
const translucentBlue = `${blue}22`;

const strokeStyle = lightGrey;
const strokeWidth = 2;

const fontSize = 24;
const fontStyle = `${fontSize}px sans-serif`;
const fontFillStyle = lightGrey;

const gapFromTagBox = 8;

export interface SelectionCoordinates {
  start: Coordinates;
  end: Coordinates;
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

export type PositionalCanvasArguments = [
  x: CanvasParameterType,
  y: CanvasParameterType,
  width: CanvasParameterType,
  height: CanvasParameterType
];

function initialDraw(
  selectionCoordinates: SelectionCoordinates,
  draw: (
    context: CanvasRenderingContext2D,
    [x, y, width, height]: PositionalCanvasArguments
  ) => void
): CanvasParameters {
  log(initialDraw.name);
  const axisScales = computeAxisScales();
  const { x, y, width, height } = computePath(axisScales, selectionCoordinates);
  const context = getCanvas2dContext();

  context.beginPath();

  draw(context, [x, y, width, height]);

  context.closePath();

  return { x, y, width, height };
}

export function drawHighlightBox(
  selectionCoordinates: SelectionCoordinates
): void {
  log(drawHighlightBox.name);

  initialDraw(selectionCoordinates, (context, [x, y, width, height]) => {
    context.rect(x, y, width, height);

    context.lineWidth = strokeWidth;
    context.strokeStyle = blue;
    context.stroke();

    context.fillStyle = translucentBlue;
    context.fill();
  });
}

export function drawTagBox(
  selectionCoordinates: SelectionCoordinates
): CanvasParameters {
  log(drawTagBox.name);

  return initialDraw(selectionCoordinates, (context, [x, y, width, height]) => {
    redrawTagBox(context, { x, y, width, height });
  });
}

export function redrawTagBox(
  context: CanvasRenderingContext2D,
  { x, y, width, height }: TagBox
): void {
  log(redrawTagBox.name);

  context.rect(x, y, width, height);
  context.strokeStyle = strokeStyle;
  context.stroke();
}

export function drawTagAnnotation(
  selectionCoordinates: SelectionCoordinates,
  text: string
): Coordinates {
  log(drawTagAnnotation.name);

  const { x, y } = initialDraw(
    selectionCoordinates,
    (context, positionalCanvasArguments) => {
      const orientation = computeOrientation(selectionCoordinates);
      const { x, y } = computeTextPlacement(
        orientation,
        positionalCanvasArguments
      );

      redrawTagAnnotation(context, { text, x, y });
    }
  );

  return { x, y };
}

export function redrawTagAnnotation(
  context: CanvasRenderingContext2D,
  { text, x, y }: TagAnnotation
): void {
  log(redrawTagAnnotation.name);

  context.font = fontStyle;
  context.fillStyle = fontFillStyle;

  context.fillText(text, x + gapFromTagBox, y + gapFromTagBox + fontSize);
}

export function drawPath(
  draw: (context: CanvasRenderingContext2D) => void
): void {
  const context = getCanvas2dContext();

  context.beginPath();

  draw(context);

  context.closePath();
}
