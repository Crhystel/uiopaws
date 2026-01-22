import { API_ORIGIN } from "@/lib/api";

/**
 * Builds an absolute URL for media paths returned by the backend.
 *
 * Examples:
 * - "storage/animal-photos/x.jpg" -> "https://.../storage/animal-photos/x.jpg"
 * - "https://.../storage/..." -> unchanged
 * - undefined/empty -> fallback
 */
export function resolveBackendMediaUrl(path: string | undefined | null, fallback = "/placeholder.svg") {
  if (!path) return fallback;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  if (path.startsWith("/")) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/${path}`;
}

export function resolveAnimalPhotoUrl(
  photo: { image_url?: string | null; photo_url?: string | null } | undefined | null,
  fallback = "/placeholder.svg"
) {
  return resolveBackendMediaUrl(photo?.image_url ?? photo?.photo_url ?? undefined, fallback);
}
