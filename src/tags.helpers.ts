import { imageIdHeading } from './elements';
import { renderApp, taggedImageService } from './main';
import { Tags } from './indexed.db';
import { setTagsCache } from './canvas.cache';

const untitledTag = 'Untitled tag';
const untitledTagRegex = /Untitled tag (?<number>\d+)/;

function createDefaultTagAnnotation(number: number) {
  return `${untitledTag} ${number + 1}`;
}

function findLastUntitledTagNumber(tags: Tags): number {
  const untitledTagCount = tags
    .map<[boolean, number]>((tag, index) => [
      tag.annotation.text.startsWith(untitledTag),
      index,
    ])
    .filter(([isUntitledTag]) => isUntitledTag)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    .map(([_, index]) => index).length;
  const lastUntitledTagIndex = untitledTagCount ? untitledTagCount - 1 : NaN;

  if (Number.isNaN(lastUntitledTagIndex)) {
    return 0;
  }

  const lastUntitledTag = tags[lastUntitledTagIndex];
  return Number(
    lastUntitledTag.annotation.text.match(untitledTagRegex)?.groups?.number ??
      '1'
  );
}

export function createNextDefaultTagAnnotation(tags: Tags) {
  return createDefaultTagAnnotation(findLastUntitledTagNumber(tags));
}

export async function updateTagsInTaggedImage(
  constructUpdatedTags: (tags: Tags) => Tags
) {
  const imageId = Number(imageIdHeading.dataset.currentId);

  const { id, image, tags } = await taggedImageService.getOne(imageId);

  const updatedTags = constructUpdatedTags(tags);
  const draftTaggedImage = {
    id,
    image,
    tags: updatedTags,
  };

  setTagsCache(updatedTags);

  await taggedImageService.updateOne(draftTaggedImage, imageId);
  await renderApp();
}
