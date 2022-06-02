import { log } from './logging';
import {
  CanvasParameters,
  Coordinates,
  Dimension,
  Dimensions,
  ImageDataUrl,
  TaggedImage,
} from './indexed.db';
import { canvasElement } from './elements';

// Upload Image Button helper functions
export function readFromFileInputEvent(event: InputEvent): Promise<File> {
  log(readFromFileInputEvent.name);
  return new Promise<File>((resolve) => {
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length) {
      const file = target.files[0];

      resolve(file);
    }
  });
}

export function readImageFileAsDataUrl(file: File): Promise<ImageDataUrl> {
  log(readImageFileAsDataUrl.name);
  return new Promise<ImageDataUrl>((resolve) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('loadend', function (event) {
      // Cast `result` confidently as string since we are reading it as data URL
      resolve((event.target as FileReader).result as ImageDataUrl);
    });

    fileReader.readAsDataURL(file);
  });
}

export function createImageFromSource(
  source: string
): Promise<HTMLImageElement> {
  log(createImageFromSource.name);
  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener('load', function () {
      resolve(image);
    });

    image.src = source;
  });
}

// Canvas helper functions
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
    // This line gurantees to TypeScript that all required properties will be present
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

// Local storage helper functions
const currentImageIdLocalStorageKey = 'currentImageId';

export function getSavedTaggedImageId(): number {
  const rawIndex =
    window.localStorage.getItem(currentImageIdLocalStorageKey) ?? NaN;

  return Number(rawIndex);
}

export function setSavedImageId(id: TaggedImage['id']): void {
  window.localStorage.setItem(currentImageIdLocalStorageKey, `${id}`);
}

export function resetSavedTaggedImageId(): void {
  window.localStorage.removeItem(currentImageIdLocalStorageKey);
}

// General helper functions
type Milliseconds = number;

export async function delay(duration: Milliseconds): Promise<void> {
  log(delay.name);
  await new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}
