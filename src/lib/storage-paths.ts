import path from "node:path";

export function storageRoot() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "la-bendicion");
  }
  return path.join(process.cwd(), "data");
}

export function dbFilePath() {
  return path.join(storageRoot(), "la-bendicion.db");
}

export function photosDir() {
  return path.join(storageRoot(), "fotos");
}
