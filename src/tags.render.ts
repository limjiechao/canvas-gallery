import { RenderParameters } from './main';
import { TaggedImage, TaggedImages } from './indexed.db';
import { tagsElement, tagTemplate } from './elements';
import { handleClickDeleteTagButton } from './tags.buttons';
import { log } from './logging';

function cloneTagTemplate() {
  return tagTemplate.content && tagTemplate.content.cloneNode(true);
}

function cloneAndPopulateTagElement(
  { annotation }: TaggedImage['tags'][number],
  index: number
) {
  const tagElement = cloneTagTemplate() as HTMLDivElement;

  const annotationElement =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tagElement.querySelector<HTMLDivElement>('.annotation')!;
  annotationElement.dataset.index = `${index}`;
  annotationElement.innerText = annotation.text;

  const deleteTagButton =
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    tagElement.querySelector<HTMLButtonElement>('.delete-button')!;
  deleteTagButton.addEventListener('click', handleClickDeleteTagButton);

  return tagElement;
}

export async function renderTags(
  {
    computedConditions: { noIndex },
    computedData: { currentImageIndex, defaultImageIndex },
  }: RenderParameters,
  taggedImages: TaggedImages
): Promise<void> {
  log(renderTags.name);

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
