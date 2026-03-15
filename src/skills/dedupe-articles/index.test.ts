import test from "node:test";
import assert from "node:assert/strict";
import { dedupeArticles } from "@/skills/dedupe-articles";

test("dedupeArticles keeps the newest duplicate", () => {
  const articles = dedupeArticles([
    {
      title: "OpenAI releases new model",
      url: "https://example.com/story?utm_source=test",
      sourceName: "Example",
      sourceDomain: "example.com",
      category: "ai-technology",
      summary: "first",
      imageUrl: null,
      publishedAt: "2026-03-15T09:00:00.000Z",
      language: "en",
      relevanceScore: 0,
      signalSummary: "",
      dedupeHash: "a"
    },
    {
      title: "OpenAI releases new model",
      url: "https://example.com/story",
      sourceName: "Example",
      sourceDomain: "example.com",
      category: "ai-technology",
      summary: "second",
      imageUrl: null,
      publishedAt: "2026-03-15T10:00:00.000Z",
      language: "en",
      relevanceScore: 0,
      signalSummary: "",
      dedupeHash: "b"
    }
  ]);

  assert.equal(articles.length, 1);
  assert.equal(articles[0]?.summary, "second");
});
