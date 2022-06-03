import { fileInput, imageUploadButton } from './elements';
import { drawTaggedImage } from './canvas.cache';
import { createImageFromSource, setSavedImageId } from './utils';
import { log } from './logging';
import { renderApp, taggedImageService } from './main';
import { DraftTaggedImage } from './indexed.db';
import {
  readFromFileInputEvent,
  readImageFileAsDataUrl,
} from './image.upload.helpers';
import { computeImageCanvasParameters } from './canvas.helpers';

const openingFilePickerLabel = 'Opening file picker…' as const;
const uploadNewImageLabel = 'Upload New Image' as const;

function handleClickUploadImageButton(event: Event): void {
  log(handleClickUploadImageButton.name);
  if (event.currentTarget) {
    const target = event.currentTarget as HTMLButtonElement;

    target.innerText = openingFilePickerLabel;
    fileInput.click();
  }
}

function handleBlurUploadImageButton(event: Event): void {
  log(handleBlurUploadImageButton.name);
  if (event.currentTarget) {
    const target = event.currentTarget as HTMLButtonElement;

    target.innerText = uploadNewImageLabel;
    target.blur();
  }
}

async function handleFileInput(event: Event): Promise<void> {
  log(handleFileInput.name);
  const imageFile = await readFromFileInputEvent(event as InputEvent);
  const imageDataUrl = await readImageFileAsDataUrl(imageFile);
  const imageElement = await createImageFromSource(imageDataUrl);
  const { x, y, width, height } = computeImageCanvasParameters(imageElement);
  const draftTaggedImage: DraftTaggedImage = {
    image: {
      dataUrl: imageDataUrl,
      x,
      y,
      width,
      height,
    },
    tags: [],
  };

  await Promise.all([
    drawTaggedImage(draftTaggedImage, imageElement),
    taggedImageService.create(draftTaggedImage).then(setSavedImageId),
  ]);
  await renderApp();
}

export function addUploadImageButtonRelatedEventListeners(): void {
  log(addUploadImageButtonRelatedEventListeners.name);
  imageUploadButton.addEventListener('click', handleClickUploadImageButton);
  imageUploadButton.addEventListener('blur', handleBlurUploadImageButton);
  fileInput.addEventListener('input', handleFileInput);
}
