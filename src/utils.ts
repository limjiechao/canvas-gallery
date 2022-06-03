import { log } from './logging';
import { TaggedImage } from './indexed.db';

// General helper functions
type Milliseconds = number;

export async function delay(duration: Milliseconds): Promise<void> {
  log(delay.name);
  await new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
}

export function createImageFromSource(
  source: string
): Promise<HTMLImageElement> {
  log(createImageFromSource.name);
  return new Promise((resolve) => {
    const image = new Image();

    image.addEventListener('load', function () {
      resolve(image);
    });

    image.src = source;
  });
}

// Local storage helper functions
const currentImageIdLocalStorageKey = 'currentImageId';

export function getSavedTaggedImageId(): number {
  log(getSavedTaggedImageId.name);
  const rawIndex =
    window.localStorage.getItem(currentImageIdLocalStorageKey) ?? NaN;

  return Number(rawIndex);
}

export function setSavedImageId(id: TaggedImage['id']): void {
  log(setSavedImageId.name);
  window.localStorage.setItem(currentImageIdLocalStorageKey, `${id}`);
}

export function resetSavedTaggedImageId(): void {
  log(resetSavedTaggedImageId.name);
  window.localStorage.removeItem(currentImageIdLocalStorageKey);
}
