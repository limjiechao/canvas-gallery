import { log } from './logging';
import { ImageDataUrl } from './indexed.db';

export function readFromFileInputEvent(event: InputEvent): Promise<File> {
  log(readFromFileInputEvent.name);
  return new Promise<File>((resolve) => {
    const target = event.target as HTMLInputElement;

    if (target.files && target.files.length) {
      const file = target.files[0];

      resolve(file);
    }
  });
}

export function readImageFileAsDataUrl(file: File): Promise<ImageDataUrl> {
  log(readImageFileAsDataUrl.name);
  return new Promise<ImageDataUrl>((resolve) => {
    const fileReader = new FileReader();

    fileReader.addEventListener('loadend', function (event) {
      // Cast `result` confidently as string since we are reading it as data URL
      resolve((event.target as FileReader).result as ImageDataUrl);
    });

    fileReader.readAsDataURL(file);
  });
}
