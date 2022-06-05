import { RenderParameters } from './main';
import { TagAnnotation, TaggedImages } from './indexed.db';
import { tagsClearButton, tagsElement, tagTemplate } from './elements';
import { handleClickDeleteTagButton, handleClickTag } from './tags.buttons';
import { log } from './logging';

function cloneTagTemplate() {
  // NOTE: Get the element out of the `documentFragment` before cloning for use
  const documentFragment: DocumentFragment = tagTemplate.content;
  const tagElement: HTMLDivElement =
    documentFragment.firstElementChild as HTMLDivElement;

  return tagElement.cloneNode(true);
}

export type TextOnlyTagAnnotation = { annotation: Pick<TagAnnotation, 'text'> };

export function cloneAndPopulateTagElement(
  { annotation: { text } }: TextOnlyTagAnnotation,
  index: number
) {
  const tagElement = cloneTagTemplate() as HTMLDivElement;

  const annotationElement =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tagElement.querySelector<HTMLDivElement>('.annotation')!;
  annotationElement.dataset.index = `${index}`;
  annotationElement.innerText = text;
  annotationElement.addEventListener('click', handleClickTag);

  const deleteTagButton =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tagElement.querySelector<HTMLButtonElement>('.delete-button')!;
  deleteTagButton.addEventListener('click', handleClickDeleteTagButton);

  return tagElement;
}

export async function renderTags(
  {
    computedConditions: { noIndex, noImages },
    computedData: { currentImageIndex, defaultImageIndex },
  }: RenderParameters,
  taggedImages: TaggedImages
): Promise<void> {
  log(renderTags.name);

  if (noImages) {
    tagsClearButton.disabled = true;
  } else {
    tagsClearButton.disabled = false;
    tagsElement.replaceChildren();

    const currentOrDefaultImageId = noIndex
      ? defaultImageIndex
      : currentImageIndex;
    const taggedImage = taggedImages[currentOrDefaultImageId];

    if (!taggedImage) return;

    const { tags } = taggedImage;

    const tagElements = tags.map(cloneAndPopulateTagElement);
    tagsElement.append(...tagElements);
  }
}
