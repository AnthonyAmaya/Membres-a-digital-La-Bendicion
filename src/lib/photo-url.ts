export function photoFileName(storedPath: string) {
  const parts = storedPath.split(/[/\\]/);
  return parts[parts.length - 1] ?? storedPath;
}

export function photoPublicUrl(storedPath?: string | null) {
  if (!storedPath) return undefined;
  return `/api/fotos/${encodeURIComponent(photoFileName(storedPath))}`;
}
