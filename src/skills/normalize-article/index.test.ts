import test from "node:test";
import assert from "node:assert/strict";
import { normalizeArticle } from "@/skills/normalize-article";
import { newsCategories } from "@/lib/config";

test("normalizeArticle converts provider article to internal shape", () => {
  const article = normalizeArticle(
    {
      title: "NVIDIA expands AI chip roadmap",
      url: "https://www.reuters.com/technology/nvidia-expands-ai-chip-roadmap?utm_source=test",
      description: "A short summary",
      sourceName: "Reuters"
    },
    newsCategories[0]
  );

  assert.ok(article);
  assert.equal(article?.sourceDomain, "reuters.com");
  assert.equal(article?.signalSummary, "");
  assert.equal(article?.url.includes("utm_source"), false);
});
