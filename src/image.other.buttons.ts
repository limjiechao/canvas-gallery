import { log } from './logging';
import {
  imageBackButton,
  imageDeleteButton,
  imageIdHeading,
  imageNextButton,
} from './elements';
import { renderApp, taggedImageService } from './main';
import { setSavedImageId } from './utils';
import { setNewCurrentImageId } from './image.browser.render';

async function handleClickDeleteImageButton(): Promise<void> {
  log(handleClickDeleteImageButton.name);

  const currentId = Number(imageIdHeading.dataset.currentId);

  await taggedImageService.deleteOne(currentId);
  setNewCurrentImageId();
  await renderApp();
}

async function handleClickBackButton(): Promise<void> {
  log(handleClickBackButton.name);

  const previousImageId = Number(imageIdHeading.dataset.previousId);
  setSavedImageId(previousImageId);

  await renderApp();
}

async function handleClickNextButton(): Promise<void> {
  log(handleClickNextButton.name);

  const nextImageId = Number(imageIdHeading.dataset.nextId);
  setSavedImageId(nextImageId);

  await renderApp();
}

export function addOtherImageButtonEventListeners(): void {
  log(addOtherImageButtonEventListeners.name);

  imageDeleteButton.addEventListener('click', handleClickDeleteImageButton);
  imageBackButton.addEventListener('click', handleClickBackButton);
  imageNextButton.addEventListener('click', handleClickNextButton);
}
