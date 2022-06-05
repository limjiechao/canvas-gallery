import './style.css';
import { addUploadImageButtonRelatedEventListeners } from './image.upload.button';
import { log } from './logging';
import { renderCanvas } from './canvas.render';
import { addCanvasRelatedEventListeners } from './canvas.actions.create.tag';
import { TaggedImages, TaggedImageService } from './indexed.db';
import { renderImageBrowser } from './image.browser.render';
import { addOtherImageButtonEventListeners } from './image.other.buttons';
import {
  displayUnsupportedMessageIfTouchScreenAndThrowError,
  getSavedTaggedImageId,
  isTouchDevice,
} from './utils';
import { addTagSectionButtonEventListeners } from './tags.buttons';
import { renderTags } from './tags.render';
import { setCanvasAbsoluteDimensions } from './canvas.helpers';
import { mainElement, touchDeviceNotSupportedElement } from './elements';

export const taggedImageService = new TaggedImageService();
export const taggedImages: TaggedImages = [];

async function handleReadyStateChange() {
  log(handleReadyStateChange.name);

  displayUnsupportedMessageIfTouchScreenAndThrowError();

  setCanvasAbsoluteDimensions(window);

  addCanvasRelatedEventListeners();
  addUploadImageButtonRelatedEventListeners();
  addOtherImageButtonEventListeners();
  addTagSectionButtonEventListeners();

  await renderApp();
}

export interface RenderData {
  readonly currentImageId: number;
  readonly currentImageIndex: number;
  readonly imageCount: number;
  readonly defaultImageId: number;
  readonly defaultImageIndex: number;
  readonly previousImageId: number;
  readonly nextImageId: number;
}

export interface RenderConditions {
  readonly noIndex: boolean;
  readonly noImages: boolean;
  readonly noPreviousImageId: boolean;
  readonly noNextImageId: boolean;
}

export interface RenderParameters {
  readonly computedData: RenderData;
  readonly computedConditions: RenderConditions;
}

export function computeRenderParameters(
  taggedImages: TaggedImages
): RenderParameters {
  log(computeRenderParameters.name);
  // Load last image by `id` otherwise default to first tagged image
  const currentImageId = getSavedTaggedImageId();
  const currentImageIndex = taggedImages.findIndex(
    ({ id }) => id === currentImageId
  );
  const imageCount = taggedImages.length;
  const defaultImageIndex = 0;
  const defaultImageId = imageCount ? taggedImages[defaultImageIndex].id : NaN;

  const noIndex = currentImageIndex === -1;
  const countIsZero = imageCount === 0;
  const noImages = noIndex && countIsZero;

  const previousImageIndex = noIndex ? NaN : currentImageIndex - 1;
  const previousImageId = taggedImages[previousImageIndex]?.id ?? NaN;
  const nextImageIndex = noIndex ? NaN : currentImageIndex + 1;
  const nextImageId = taggedImages[nextImageIndex]?.id ?? NaN;

  const noPreviousImageId = Number.isNaN(previousImageId);
  const noNextImageId = Number.isNaN(nextImageId);

  const computedData: RenderData = {
    currentImageId,
    currentImageIndex,
    imageCount,
    defaultImageId,
    defaultImageIndex,
    previousImageId,
    nextImageId,
  };

  const computedConditions: RenderConditions = {
    noIndex,
    noImages,
    noPreviousImageId,
    noNextImageId,
  };

  return { computedData, computedConditions };
}

export async function renderApp(): Promise<void> {
  log(renderApp.name);

  const taggedImages = await taggedImageService.getAll();
  const renderParameters = computeRenderParameters(taggedImages);

  // TODO: If no image, disable tagging
  await Promise.all([
    renderImageBrowser(renderParameters),
    renderCanvas(renderParameters, taggedImages),
    renderTags(renderParameters, taggedImages),
  ]);
}

document.addEventListener('readystatechange', handleReadyStateChange);
