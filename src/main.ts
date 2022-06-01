import './style.css';
import { log } from './logging';
import {
  addCanvasRelatedEventListeners,
  setCanvasAbsoluteDimensions,
} from './canvas';
import { TaggedImageService } from './indexed.db';

export const taggedImageService = new TaggedImageService();

async function onReadyStateChange() {
  log(onReadyStateChange.name);
  setCanvasAbsoluteDimensions(window);
  addCanvasRelatedEventListeners();
  addUploadImageButtonRelatedEventListeners();
}

document.addEventListener('readystatechange', onReadyStateChange);
