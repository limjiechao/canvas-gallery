import { log } from './logging';
import { createImageFromSource } from './utils';
import {
  CanvasParameters,
  CanvasParameterType,
  Coordinates,
  DraftTaggedImage,
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
    resetImage();
    clearCanvas();
  } else {
    const image: TaggedImage =
      taggedImages[noIndex ? defaultImageIndex : currentImageIndex];

    await drawTaggedImage(image);
  }
}

// Rendering images

// NOTE: Cache to avoid having to fetch from database in between re-renders while tagging
const image = {
  _element: new Image() as HTMLImageElement,
  _parameters: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  } as CanvasParameters,
  get element(): HTMLImageElement {
    return this._element;
  },
  set element(image: HTMLImageElement) {
    this._element = image;
  },
  get parameters(): CanvasParameters {
    return this._parameters;
  },
  set parameters(parameters: CanvasParameters) {
    this._parameters = parameters;
  },
};

function resetImage(): void {
  image.element = new Image();
  image.parameters = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
}

function drawImage(
  image: HTMLImageElement,
  { width, height, x, y }: CanvasParameters
): void {
  log(drawImage.name);
  const context = getCanvas2dContext();
  context.drawImage(image, x, y, width, height);
}

export function redrawImage(): void {
  drawImage(image.element, image.parameters);
}

export async function drawTaggedImage(
  taggedImage: TaggedImage | DraftTaggedImage,
  createdImageElement?: HTMLImageElement
): Promise<void> {
  log(drawTaggedImage.name);
  const {
    image: { dataUrl, x, y, width, height },
    tags,
  } = taggedImage;
  image.element = await (createdImageElement
    ? Promise.resolve(createdImageElement)
    : createImageFromSource(dataUrl));
  image.parameters = { x, y, width, height };

  drawImage(image.element, image.parameters);

  // TODO: Redraw tags
  tags.forEach((tag) => {
    //
  });
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

function useCanvas(
  selectionCoordinates: SelectionCoordinates,
  draw: (
    context: CanvasRenderingContext2D,
    [x, y, width, height]: PositionalCanvasArguments
  ) => void
): void {
  log(useCanvas.name);
  const axisScales = computeAxisScales();
  const { x, y, width, height } = computePath(axisScales, selectionCoordinates);
  const context = getCanvas2dContext();

  context.beginPath();

  draw(context, [x, y, width, height]);

  context.closePath();
}

function drawBox(
  selectionCoordinates: SelectionCoordinates,
  configureRectangle: (context: CanvasRenderingContext2D) => void
): void {
  log(drawBox.name);
  useCanvas(selectionCoordinates, (context, [x, y, width, height]) => {
    context.rect(x, y, width, height);
    configureRectangle(context);
  });
}

export function drawHighlightBox(
  selectionCoordinates: SelectionCoordinates
): void {
  log(drawHighlightBox.name);
  drawBox(selectionCoordinates, (context) => {
    context.lineWidth = strokeWidth;
    context.strokeStyle = blue;
    context.stroke();

    context.fillStyle = translucentBlue;
    context.fill();
  });
}

export function drawTagBox(selectionCoordinates: SelectionCoordinates): void {
  log(drawTagBox.name);
  drawBox(selectionCoordinates, (context) => {
    context.strokeStyle = strokeStyle;
    context.stroke();
  });
}

export function drawTagAnnotation(
  selectionCoordinates: SelectionCoordinates,
  text: string
): void {
  log(drawTagAnnotation.name);

  useCanvas(selectionCoordinates, (context, positionalCanvasArguments) => {
    const orientation = computeOrientation(selectionCoordinates);
    const { x, y } = computeTextPlacement(
      orientation,
      positionalCanvasArguments
    );

    context.font = fontStyle;
    context.fillStyle = fontFillStyle;

    context.fillText(text, x + gapFromTagBox, y + gapFromTagBox + fontSize);

    context.closePath();
  });
}
