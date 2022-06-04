import { tagsClearButton } from './elements';
import { log } from './logging';
import {
  createNextDefaultTagAnnotation,
  updateTagsInTaggedImage,
} from './tags.helpers';
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
  const replyOrNoReply = window.prompt('Edit annotation', oldText);

  // NOTE: If no change in annotation text, stop here to save a database round trip and re-render
  if (replyOrNoReply === oldText) return;
  // NOTE: If user presses "Cancel", stop here to save a database round trip and re-render
  if (Object.is(replyOrNoReply, null)) return;

  // NOTE: We can safely cast it as string at this point
  const reply = replyOrNoReply as string;

  await updateTagsInTaggedImage((tags) => {
    // NOTE: If `reply` is empty string, create a default tag annotation
    const text = reply ? reply : createNextDefaultTagAnnotation(tags);

    return tags.map((tag, index) =>
      index === tagIndex
        ? {
            ...tag,
            annotation: {
              ...tag.annotation,
              text,
            },
          }
        : tag
    );
  });
}

export async function handleClickClearTagsButton() {
  log(handleClickClearTagsButton.name);

  await updateTagsInTaggedImage(() => []);
}

export function addTagSectionButtonEventListeners(): void {
  tagsClearButton.addEventListener('click', handleClickClearTagsButton);
}
