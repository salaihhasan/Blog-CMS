/**
 * Turns a picked image file into a data URI so it can be stored straight in
 * the blog document.
 *
 * The `thumbnail` field is a plain String in the Blog model and the backend has
 * no upload endpoint, so a data URI is the only way to make an uploaded image
 * survive a refresh without touching the API. The size guard keeps the stored
 * document (and MongoDB's 16MB limit) sane.
 *
 * When an upload route is added, replace the body of `fileToDataUri` with a
 * POST and return the hosted URL instead.
 */

export const MAX_IMAGE_BYTES = 400 * 1024; // 400KB

const ALLOWED = /^image\/(png|jpeg|jpg|webp|gif)$/;

export type ImageResult =
  | { ok: true; dataUri: string; bytes: number }
  | { ok: false; error: string };

export const fileToDataUri = (file: File): Promise<ImageResult> =>
  new Promise((resolve) => {
    if (!ALLOWED.test(file.type)) {
      resolve({ ok: false, error: "Only JPG, PNG, WEBP or GIF images are supported." });
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      resolve({
        ok: false,
        error: `Image is ${Math.round(file.size / 1024)}KB. Please use an image under ${MAX_IMAGE_BYTES / 1024}KB.`,
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== "string") {
        resolve({ ok: false, error: "Could not read that image." });
        return;
      }
      resolve({ ok: true, dataUri: reader.result, bytes: file.size });
    };
    reader.onerror = () => resolve({ ok: false, error: "Could not read that image." });
    reader.readAsDataURL(file);
  });
