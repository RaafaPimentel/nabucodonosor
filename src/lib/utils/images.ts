import { allowedImageHosts } from "@/lib/config";

export function isAllowedImageUrl(imageUrl: string | null | undefined) {
  if (!imageUrl) {
    return false;
  }

  try {
    const url = new URL(imageUrl);
    const hostname = url.hostname.replace(/^www\./, "");
    return allowedImageHosts.includes(hostname);
  } catch {
    return false;
  }
}
