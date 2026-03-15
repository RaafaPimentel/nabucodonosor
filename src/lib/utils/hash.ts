import { createHash } from "crypto";

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function extractDomain(input: string) {
  try {
    return new URL(input).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function canonicalizeUrl(input: string) {
  try {
    const url = new URL(input);
    url.hash = "";
    const droppedParams = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "ref"];
    droppedParams.forEach((key) => url.searchParams.delete(key));
    url.hostname = url.hostname.replace(/^www\./, "");
    return url.toString();
  } catch {
    return input.trim();
  }
}

export function normalizeTitle(input: string) {
  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
