/**
 * Media upload — client-side compression, signed-URL PUT with progress, retry.
 *
 * Flow:
 *  1. compressImage() (or leave video untouched)
 *  2. createSignedUploadUrl() server fn returns { signed_url, path, token }
 *  3. PUT bytes to signed_url via XHR (progress events)
 *  4. createSignedReadUrl() with long TTL → store as media_url on the post
 */
import { createSignedUploadUrl, createSignedReadUrl } from "./storage.functions";

export type UploadProgress = {
  loaded: number;
  total: number;
  pct: number;
};

export type UploadResult = {
  path: string;
  url: string; // long-lived signed URL
  contentType: string;
};

const MAX_IMAGE_DIM = 1920;
const IMAGE_QUALITY = 0.86;
const LONG_TTL = 60 * 60 * 24 * 365; // 1 year

export async function compressImage(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const { width, height } = bitmap;
  const scale = Math.min(1, MAX_IMAGE_DIM / Math.max(width, height));
  const w = Math.round(width * scale);
  const h = Math.round(height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close?.();
  return await new Promise<Blob>((res) =>
    canvas.toBlob((b) => res(b || file), "image/jpeg", IMAGE_QUALITY),
  );
}

export async function blobFromCanvas(canvas: HTMLCanvasElement, type = "image/jpeg", q = IMAGE_QUALITY): Promise<Blob> {
  return new Promise((res, rej) => canvas.toBlob((b) => (b ? res(b) : rej(new Error("canvas empty"))), type, q));
}

function randomId(): string {
  const arr = new Uint8Array(8);
  (globalThis.crypto ?? crypto).getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function extFor(contentType: string): string {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/png") return "png";
  if (contentType === "image/webp") return "webp";
  if (contentType === "image/gif") return "gif";
  if (contentType === "video/mp4") return "mp4";
  if (contentType === "video/webm") return "webm";
  if (contentType === "video/quicktime") return "mov";
  return "bin";
}

export type UploadOptions = {
  userId: string;
  bucket?: "posts" | "avatars" | "vehicles" | "marketplace";
  onProgress?: (p: UploadProgress) => void;
  signal?: AbortSignal;
};

/** Upload a Blob to storage with signed URL + XHR progress. */
export async function uploadBlob(blob: Blob, opts: UploadOptions): Promise<UploadResult> {
  const bucket = opts.bucket ?? "posts";
  const contentType = blob.type || "application/octet-stream";
  const path = `${opts.userId}/${Date.now()}-${randomId()}.${extFor(contentType)}`;

  const signed = await createSignedUploadUrl({
    data: { bucket, path, content_type: contentType },
  });

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signed.signed_url, true);
    xhr.setRequestHeader("Content-Type", contentType);
    xhr.setRequestHeader("x-upsert", "true");
    if (opts.signal) opts.signal.addEventListener("abort", () => xhr.abort());
    xhr.upload.onprogress = (e) => {
      if (!e.lengthComputable) return;
      opts.onProgress?.({ loaded: e.loaded, total: e.total, pct: e.total ? e.loaded / e.total : 0 });
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.onabort = () => reject(new Error("Upload cancelled"));
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else reject(new Error(`Upload failed [${xhr.status}]: ${xhr.responseText || xhr.statusText}`));
    };
    xhr.send(blob);
  });

  const read = await createSignedReadUrl({
    data: { bucket, path: signed.path, expires_in: LONG_TTL },
  });

  return { path: signed.path, url: read.signed_url, contentType };
}

/** Upload with automatic retry (exponential backoff). */
export async function uploadWithRetry(
  blob: Blob,
  opts: UploadOptions,
  attempts = 3,
): Promise<UploadResult> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await uploadBlob(blob, opts);
    } catch (e) {
      lastErr = e;
      if (opts.signal?.aborted) throw e;
      await new Promise((r) => setTimeout(r, 400 * Math.pow(2, i)));
    }
  }
  throw lastErr instanceof Error ? lastErr : new Error("Upload failed");
}
