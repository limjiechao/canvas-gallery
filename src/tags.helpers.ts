import { imageIdHeading } from './elements';
import { renderApp, taggedImageService } from './main';
import { Tags } from './indexed.db';
import { setTagsCache } from './canvas.render.cache';

const untitledTag = 'Untitled tag';
const untitledTagRegex = /Untitled tag (?<number>\d+)/;

function createDefaultTagAnnotation(number: number) {
  return `${untitledTag} ${number + 1}`;
}

function findLargestUntitledTagNumber(tags: Tags): number {
  const untitledTagNumbers = tags
    .filter((tag) => tag.annotation.text.startsWith(untitledTag))
    .map((tag) =>
      Number(tag.annotation.text.match(untitledTagRegex)?.groups?.number ?? 0)
    );

  return untitledTagNumbers.length ? Math.max(...untitledTagNumbers) : 0;
}

export function createNextDefaultTagAnnotation(tags: Tags) {
  return createDefaultTagAnnotation(findLargestUntitledTagNumber(tags));
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
