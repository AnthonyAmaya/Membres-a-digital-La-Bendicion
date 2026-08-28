import fs from "node:fs";
import path from "node:path";

import { photoFileName } from "./photo-url";
import { photosDir } from "./storage-paths";

export { photoFileName, photoPublicUrl } from "./photo-url";

export const PHOTOS_DIR = photosDir();

const ALLOWED = new Map([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

const MAX_BYTES = 5 * 1024 * 1024;

export function ensurePhotosDir() {
  fs.mkdirSync(PHOTOS_DIR, { recursive: true });
}

function extensionFor(mime: string, originalName = "") {
  const fromMime = ALLOWED.get(mime);
  if (fromMime) return fromMime;
  const name = originalName.split(".").pop()?.toLowerCase();
  if (name === "jpg" || name === "jpeg") return "jpg";
  if (name === "png") return "png";
  if (name === "webp") return "webp";
  return undefined;
}

export function saveMemberPhoto(buffer: Buffer, mime: string, originalName = "") {
  const ext = extensionFor(mime, originalName);
  if (!ext) {
    throw new Error("Usa una foto en JPG, PNG o WebP.");
  }
  if (buffer.length > MAX_BYTES) {
    throw new Error("La foto no puede pesar más de 5 MB.");
  }
  ensurePhotosDir();
  const name = `${crypto.randomUUID()}.${ext}`;
  fs.writeFileSync(path.join(PHOTOS_DIR, name), buffer);
  return `fotos/${name}`;
}

export function deletePhotoFile(storedPath?: string | null) {
  if (!storedPath) return;
  const full = path.join(PHOTOS_DIR, photoFileName(storedPath));
  if (fs.existsSync(full)) fs.unlinkSync(full);
}

export function readPhoto(filename: string) {
  if (!/^[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(filename)) return null;
  const full = path.join(PHOTOS_DIR, filename);
  if (!fs.existsSync(full)) return null;
  const ext = path.extname(filename).toLowerCase();
  const type =
    ext === ".png" ? "image/png" : ext === ".webp" ? "image/webp" : "image/jpeg";
  return { buffer: fs.readFileSync(full), type };
}

export function clearAllPhotos() {
  if (!fs.existsSync(PHOTOS_DIR)) return;
  for (const file of fs.readdirSync(PHOTOS_DIR)) {
    if (file.startsWith(".")) continue;
    fs.unlinkSync(path.join(PHOTOS_DIR, file));
  }
}
