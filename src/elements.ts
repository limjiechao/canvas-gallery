/* eslint-disable @typescript-eslint/no-non-null-assertion */

export const canvasElement =
  document.querySelector<HTMLCanvasElement>('#canvas')!;

export const imageIdHeading =
  document.querySelector<HTMLHeadingElement>('#image-id')!;

export const imagePaginationSpan =
  document.querySelector<HTMLSpanElement>('#image-pagination')!;

export const imageBackButton =
  document.querySelector<HTMLButtonElement>('#image-back-button')!;

export const imageNextButton =
  document.querySelector<HTMLButtonElement>('#image-next-button')!;

export const imageDeleteButton = document.querySelector<HTMLButtonElement>(
  '#image-delete-button'
)!;

export const imageUploadButton = document.querySelector<HTMLButtonElement>(
  '#image-upload-button'
)!;

export const fileInput =
  document.querySelector<HTMLInputElement>('#file-input')!;

export const tagsElement = document.querySelector<HTMLDivElement>('#tags')!;

export const tagTemplate =
  document.querySelector<HTMLTemplateElement>('#tag-template')!;

export const tagsClearButton =
  document.querySelector<HTMLButtonElement>('#tags-clear-button')!;
