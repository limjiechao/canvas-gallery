import { fileInput, imageUploadButton } from './elements';
import { drawTaggedImage } from './canvas.render';
import {
  computeImageCanvasParameters,
  createImageFromSource,
  readFromFileInputEvent,
  readImageFileAsDataUrl,
  setSavedImageId,
} from './utils';
import { log } from './logging';
import { renderApp, taggedImageService } from './main';
import { DraftTaggedImage } from './indexed.db';

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
    tags: [
      {
        annotation: {
          text: crypto.randomUUID(),
          x: 300,
          y: 400,
        },
        box: {
          width: 500,
          height: 600,
          x: 300,
          y: 400,
        },
      },
      {
        annotation: {
          text: crypto.randomUUID(),
          x: 500,
          y: 700,
        },
        box: {
          width: 700,
          height: 800,
          x: 200,
          y: 100,
        },
      },
    ],
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
