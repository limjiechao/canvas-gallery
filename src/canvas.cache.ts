import {
  CanvasParameters,
  DraftTaggedImage,
  TaggedImage,
  Tags,
} from './indexed.db';
import { log } from './logging';
import { createImageFromSource } from './utils';
import {
  drawImage,
  drawPath,
  redrawTagAnnotation,
  redrawTagBox,
} from './canvas.render';
import { clearCanvas } from './canvas.helpers';

/**
 * NOTE: Cache to avoid having to fetch from database in between re-renders while tagging
 * NOTE: All direct cache mutations in the app happen only in this file for sanity's sake
 */
const imageCache = {
  _element: new Image() as HTMLImageElement,
  _parameters: {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  } as CanvasParameters,
  get element(): HTMLImageElement {
    return this._element;
  },
  set element(image: HTMLImageElement) {
    this._element = image;
  },
  get parameters(): CanvasParameters {
    return this._parameters;
  },
  set parameters(parameters: CanvasParameters) {
    this._parameters = parameters;
  },
};

const tagsCache = {
  _tags: [] as Tags,
  get list(): Tags {
    return this._tags;
  },
  set list(tags: Tags) {
    this._tags = structuredClone(tags);
  },
};

export function resetImageCache(): void {
  log(resetImageCache.name);

  imageCache.element = new Image();
  imageCache.parameters = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  };
}

export function resetTagsCache(): void {
  log(resetTagsCache.name);

  tagsCache.list = [];
}

export function setTagsCache(tags: Tags): void {
  log(setTagsCache.name);
  tagsCache.list = tags;
}

export async function drawTaggedImage(
  taggedImage: TaggedImage | DraftTaggedImage,
  createdImageElement?: HTMLImageElement
): Promise<void> {
  log(drawTaggedImage.name);

  await setTaggedImageToCache(taggedImage, createdImageElement);

  drawTaggedImageFromCache();
}

async function setTaggedImageToCache(
  taggedImage: TaggedImage | DraftTaggedImage,
  createdImageElement?: HTMLImageElement
) {
  log(setTaggedImageToCache.name);

  const {
    image: { dataUrl, x, y, width, height },
    tags,
  } = taggedImage;

  imageCache.element = await (createdImageElement
    ? Promise.resolve(createdImageElement)
    : createImageFromSource(dataUrl));
  imageCache.parameters = { x, y, width, height };
  tagsCache.list = tags;
}

export function drawTaggedImageFromCache() {
  log(drawTaggedImageFromCache.name);

  clearCanvas();
  redrawImage();
  redrawTags();
}

export function redrawImage(): void {
  log(redrawImage.name);

  drawImage(imageCache.element, imageCache.parameters);
}

export function redrawTags(): void {
  log(redrawTags.name);

  drawPath((context) => {
    tagsCache.list.forEach((tag) => {
      const { box, annotation } = tag;
      redrawTagBox(context, box);
      redrawTagAnnotation(context, annotation);
    });
  });
}
