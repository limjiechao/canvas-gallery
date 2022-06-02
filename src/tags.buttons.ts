import { imageIdHeading, tagsClearButton } from './elements';
import { log } from './logging';
import { renderApp, taggedImageService } from './main';

export async function handleClickDeleteTagButton(event: Event): Promise<void> {
  log(handleClickDeleteTagButton.name);

  const deleteButton = event.currentTarget as HTMLButtonElement;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const annotationElement = deleteButton.parentElement!
    .firstElementChild as HTMLDivElement;
  const tagIndex = Number(annotationElement.dataset.index);
  log(tagIndex);

  const imageId = Number(imageIdHeading.dataset.currentId);

  const { id, image, tags } = await taggedImageService.getOne(imageId);

  const updatedTaggedImage = {
    id,
    image,
    tags: tags.filter((tag, index) => index !== tagIndex),
  };

  await taggedImageService.updateOne(updatedTaggedImage, imageId);
  await renderApp();
}

export async function handleClickClearTagsButton() {
  log(handleClickClearTagsButton.name);

  const imageId = Number(imageIdHeading.dataset.currentId);

  const { id, image } = await taggedImageService.getOne(imageId);

  const draftTaggedImage = {
    id,
    image,
    tags: [],
  };

  await taggedImageService.updateOne(draftTaggedImage, imageId);
  await renderApp();
}

export function addTagSectionButtonEventListeners(): void {
  tagsClearButton.addEventListener('click', handleClickClearTagsButton);
}
