import { imageIdHeading } from './elements';
import { renderApp, taggedImageService } from './main';
import { Tags } from './indexed.db';
import { setTagsCache } from './canvas.cache';

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
