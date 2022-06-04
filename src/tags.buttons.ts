import { tagsClearButton } from './elements';
import { log } from './logging';
import { updateTagsInTaggedImage } from './tags.helpers';
import { delay } from './utils';

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

export async function handleClickTag(event: Event) {
  const annotationElement = event.currentTarget as HTMLDivElement;
  const tagIndex = Number(annotationElement.dataset.index);
  const oldText = annotationElement.innerText;

  // NOTE: Deliberate delay
  await delay(250);

  const reply = window.prompt('Edit annotation', oldText) ?? '';
  const text = reply ? reply : oldText;

  // NOTE: If no change in annotation text, stop here to save a database round trip and re-render
  if (text === oldText) return;

  await updateTagsInTaggedImage((tags) =>
    tags.map((tag, index) =>
      index === tagIndex
        ? {
            ...tag,
            annotation: {
              ...tag.annotation,
              text,
            },
          }
        : tag
    )
  );
}

export async function handleClickClearTagsButton() {
  log(handleClickClearTagsButton.name);

  await updateTagsInTaggedImage(() => []);
}

export function addTagSectionButtonEventListeners(): void {
  tagsClearButton.addEventListener('click', handleClickClearTagsButton);
}
