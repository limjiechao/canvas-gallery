import { tagsClearButton } from './elements';
import { log } from './logging';
import { updateTagsInTaggedImage } from './tags.helpers';

export async function handleClickDeleteTagButton(event: Event): Promise<void> {
  log(handleClickDeleteTagButton.name);

  const deleteButton = event.currentTarget as HTMLButtonElement;
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const annotationElement = deleteButton.parentElement!
    .firstElementChild as HTMLDivElement;
  const tagIndex = Number(annotationElement.dataset.index);
  log(tagIndex);

  await updateTagsInTaggedImage((tags) =>
    tags.filter((_, index) => index !== tagIndex)
  );
}

export async function handleClickClearTagsButton() {
  log(handleClickClearTagsButton.name);

  await updateTagsInTaggedImage(() => []);
}

export function addTagSectionButtonEventListeners(): void {
  tagsClearButton.addEventListener('click', handleClickClearTagsButton);
}
