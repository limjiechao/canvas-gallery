import {
  imageBackButton,
  imageDeleteButton,
  imageIdHeading,
  imageNextButton,
  imagePaginationSpan,
} from './elements';
import { RenderConditions, RenderData, RenderParameters } from './main';
import { resetSavedTaggedImageId, setSavedImageId } from './utils';
import { log } from './logging';

function renderImageId(
  { noIndex, noImages, noPreviousImageId, noNextImageId }: RenderConditions,
  { currentImageId, defaultImageId, previousImageId, nextImageId }: RenderData
): void {
  log(renderImageId.name);

  if (noImages) {
    imageIdHeading.dataset.currentId = '';
    imageIdHeading.innerText = 'Upload an image to start';
  } else {
    const currentOrDefaultImageId = noIndex ? defaultImageId : currentImageId;

    imageIdHeading.dataset.previousId = `${
      noPreviousImageId ? '' : previousImageId
    }`;
    imageIdHeading.dataset.nextId = `${noNextImageId ? '' : nextImageId}`;
    imageIdHeading.dataset.currentId = `${currentOrDefaultImageId}`;
    imageIdHeading.innerText = `Image ${currentOrDefaultImageId}`;
  }
}

function renderImagePagination(
  { noIndex, noImages }: RenderConditions,
  { currentImageIndex, imageCount, defaultImageIndex }: RenderData
): void {
  log(renderImagePagination.name);

  imagePaginationSpan.innerText = noImages
    ? `No images`
    : `${
        (noIndex ? defaultImageIndex : currentImageIndex) + 1
      } of ${imageCount}`;
}

function renderBackNextAndDeleteButtons({
  noImages,
  noPreviousImageId,
  noNextImageId,
}: RenderConditions): void {
  log(renderBackNextAndDeleteButtons.name);

  imageBackButton.disabled = noImages || noPreviousImageId;
  imageBackButton.style.opacity = noImages || noPreviousImageId ? '0.5' : '1';
  imageNextButton.disabled = noImages || noNextImageId;
  imageNextButton.style.opacity = noImages || noNextImageId ? '0.5' : '1';

  imageDeleteButton.disabled = noImages;
}

export function setNewCurrentImageId() {
  const previousId = Number(imageIdHeading.dataset.previousId);
  const nextId = Number(imageIdHeading.dataset.nextId);

  resetSavedTaggedImageId();

  const hasPreviousAndNextImage = previousId && nextId;
  if (hasPreviousAndNextImage) {
    setSavedImageId(previousId);
  }

  const noNextImage = !nextId && previousId;
  if (noNextImage) {
    setSavedImageId(previousId);
  }

  const noPreviousImage = !previousId && nextId;
  if (noPreviousImage) {
    setSavedImageId(nextId);
  }
}

export async function renderImageBrowser({
  computedData,
  computedConditions,
}: RenderParameters): Promise<void> {
  log(renderImageBrowser.name);

  renderImageId(computedConditions, computedData);
  renderImagePagination(computedConditions, computedData);
  renderBackNextAndDeleteButtons(computedConditions);
}
