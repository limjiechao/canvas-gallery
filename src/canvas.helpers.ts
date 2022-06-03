import { log } from './logging';
import { canvasElement } from './elements';
import {
  CanvasParameters,
  Coordinates,
  Dimension,
  Dimensions,
} from './indexed.db';
import {
  PositionalCanvasArguments,
  SelectionCoordinates,
} from './canvas.render';

const contextId = '2d' as const;

export function getCanvas2dContext() {
  log(getCanvas2dContext.name);
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  return canvasElement.getContext && canvasElement.getContext(contextId)!;
}

export function centerImageOnCanvas(imageDimensions: Dimensions): Coordinates {
  log(centerImageOnCanvas.name);
  return {
    x: (canvasElement.width - imageDimensions.width) / 2,
    y: (canvasElement.height - imageDimensions.height) / 2,
  };
}

export function resizeImageToFitCanvas(image: HTMLImageElement): Dimensions {
  log(resizeImageToFitCanvas.name);

  // Find ratio of image of each canvas dimension
  const imageToCanvasDimensionRatio: Dimensions = {
    height: image.height / canvasElement.height,
    width: image.width / canvasElement.width,
  };

  // Determine bigger dimension by comparing image to canvas
  const [[biggerDimension, biggerRatio], [smallerDimension]] = (
    Object.entries(imageToCanvasDimensionRatio) as [Dimension, number][]
  ).sort(
    (
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [previousDimension, previousRatio],
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      [currentDimension, currentRatio]
    ) => {
      if (currentRatio > previousRatio) {
        return 1;
      } else if (currentRatio < previousRatio) {
        return -1;
      }
      return 0;
    }
  );
  const scaleDownRatio = 1 / biggerRatio;

  return {
    // This line guarantees to TypeScript that all required properties will be present
    ...{ height: 0, width: 0 },
    // Simply set bigger dimension to canvas dimension
    [biggerDimension]: canvasElement[biggerDimension],
    // Scale the small dimension with bigger dimension ratio
    [smallerDimension]: image[smallerDimension] * scaleDownRatio,
  };
}

export function computeImageCanvasParameters(
  image: HTMLImageElement
): CanvasParameters {
  log(computeImageCanvasParameters.name);
  const { height, width } = resizeImageToFitCanvas(image);
  const { x, y } = centerImageOnCanvas({ height, width });

  return { height, width, x, y };
}

type AxisScale = 'xScale' | 'yScale';
type AxisScales = Record<AxisScale, number>;

export function computeAxisScales(): AxisScales {
  log(computeAxisScales.name);
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
  { start, end }: SelectionCoordinates
): CanvasParameters {
  log(computePath.name);
  const x = start.x * xScale;
  const y = start.y * yScale;
  const width = (end.x - start.x) * xScale;
  const height = (end.y - start.y) * yScale;

  return { x, y, width, height };
}

enum Direction {
  Up = 'Up',
  Down = 'Down',
  Left = 'Left',
  Right = 'Right',
}

interface Orientation {
  x: Direction.Left | Direction.Right;
  y: Direction.Up | Direction.Down;
}

export function computeOrientation(
  selectionCoordinates: SelectionCoordinates
): Orientation {
  const { start, end } = selectionCoordinates;

  const x = start.x < end.x ? Direction.Right : Direction.Left;
  const y = start.y < end.y ? Direction.Down : Direction.Up;

  return { x, y };
}

export function computeTextPlacement(
  orientation: Orientation,
  [x, y, width, height]: PositionalCanvasArguments
): Coordinates {
  const isLeft = orientation.x === Direction.Left;
  const isRight = orientation.x === Direction.Right;
  const isUp = orientation.y === Direction.Up;
  const isDown = orientation.y === Direction.Down;

  switch (true) {
    case isLeft && isUp:
      // Left + Up =>  Subtract width from `x` and subtract height from `y`
      return { x: x + width, y: y + height };
    case isLeft && isDown:
      // Left + Down => Subtract width from `x`
      return { x: x + width, y };
    case isRight && isUp:
      // Right + Up => Subtract height from `y`
      return { x, y: y + height };
    case isRight && isDown:
    default:
      // Right + Down => No modification
      return { x, y };
  }
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
  log(clearCanvas.name);
  const context = getCanvas2dContext();
  context.clearRect(0, 0, canvasElement.width, canvasElement.height);
}
