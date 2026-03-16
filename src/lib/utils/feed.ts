import { FeedItem, FeedSource } from "@/lib/types";
import { extractDomain } from "@/lib/utils/hash";

function decodeEntities(value: string) {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractTag(block: string, tagNames: string[]) {
  for (const tagName of tagNames) {
    const pattern = new RegExp(`<${tagName}\\b[^>]*>([\\s\\S]*?)<\\/${tagName}>`, "i");
    const match = block.match(pattern);

    if (match?.[1]) {
      return decodeEntities(match[1]);
    }
  }

  return "";
}

function extractAttribute(block: string, tagName: string, attributeName: string) {
  const pattern = new RegExp(`<${tagName}\\b[^>]*\\s${attributeName}=["']([^"']+)["'][^>]*\\/?>`, "i");
  return decodeEntities(block.match(pattern)?.[1] ?? "");
}

function extractAtomLink(block: string) {
  const relAlternate = block.match(/<link\b[^>]*rel=["']alternate["'][^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1];
  const href = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i)?.[1];

  return decodeEntities(relAlternate ?? href ?? "");
}

function extractCategories(block: string) {
  const values = [
    ...Array.from(block.matchAll(/<category\b[^>]*>([\s\S]*?)<\/category>/gi), (match) => decodeEntities(match[1])),
    ...Array.from(block.matchAll(/<category\b[^>]*term=["']([^"']+)["'][^>]*\/?>/gi), (match) => decodeEntities(match[1]))
  ];

  return values.filter(Boolean);
}

function extractImageUrl(block: string) {
  const mediaUrl =
    extractAttribute(block, "media:content", "url") ||
    extractAttribute(block, "media:thumbnail", "url") ||
    extractAttribute(block, "enclosure", "url");

  if (mediaUrl) {
    return mediaUrl;
  }

  const html = extractTag(block, ["content:encoded", "description", "summary", "content"]);
  return decodeEntities(html.match(/<img\b[^>]*src=["']([^"']+)["'][^>]*>/i)?.[1] ?? "");
}

function toItem(block: string, source: FeedSource, isAtom: boolean): FeedItem {
  const title = stripTags(extractTag(block, ["title"]));
  const description = stripTags(extractTag(block, isAtom ? ["summary", "content"] : ["description", "content:encoded"]));
  const publishedAt = extractTag(block, isAtom ? ["published", "updated"] : ["pubDate", "dc:date"]);
  const guid = extractTag(block, isAtom ? ["id"] : ["guid"]);
  const url = isAtom ? extractAtomLink(block) : extractTag(block, ["link"]);

  return {
    title,
    url,
    guid,
    sourceName: source.name,
    sourceDomain: extractDomain(source.siteUrl),
    description,
    imageUrl: extractImageUrl(block),
    publishedAt,
    language: source.language,
    categories: extractCategories(block)
  };
}

export function parseFeedXml(xml: string, source: FeedSource) {
  const items: FeedItem[] = [];
  const itemMatches = Array.from(xml.matchAll(/<item\b[\s\S]*?<\/item>/gi));

  if (itemMatches.length) {
    itemMatches.forEach((match) => items.push(toItem(match[0], source, false)));
    return items;
  }

  const entryMatches = Array.from(xml.matchAll(/<entry\b[\s\S]*?<\/entry>/gi));
  entryMatches.forEach((match) => items.push(toItem(match[0], source, true)));
  return items;
}
