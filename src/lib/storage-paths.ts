import path from "node:path";

export function storageRoot() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "la-bendicion");
  }
  return path.join(process.cwd(), "data");
}

export function dbFilePath() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "la-bendicion", "la-bendicion.db");
  }
  return path.join(process.cwd(), "data", "la-bendicion.db");
}

export function photosDir() {
  if (process.env.VERCEL) {
    return path.join("/tmp", "la-bendicion", "fotos");
  }
  return path.join(process.cwd(), "data", "fotos");
}
