import { log } from './logging';
import { TaggedImage } from './indexed.db';
import { mainElement, touchDeviceNotSupportedElement } from './elements';

// General helper functions

function isTouchDevice(): boolean {
  return (
    'ontouchstart' in window ||
    window.matchMedia('(pointer: coarse)').matches ||
    navigator.maxTouchPoints > 0 ||
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    navigator.msMaxTouchPoints > 0
  );
}

export function displayUnsupportedMessageIfTouchScreenAndThrowError(): void {
  if (isTouchDevice()) {
    mainElement.classList.add('hidden');
    touchDeviceNotSupportedElement.classList.remove('hidden');

    throw new Error('Touch device is not supported');
  }
}

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
