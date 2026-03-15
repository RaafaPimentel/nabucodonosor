import test from "node:test";
import assert from "node:assert/strict";
import { newsCategories } from "@/lib/config";
import { scoreArticle } from "@/skills/score-article";

test("scoreArticle returns a ranked score with a signal summary", () => {
  const result = scoreArticle(
    {
      title: "OpenAI and NVIDIA deepen AI infrastructure push",
      url: "https://reuters.com/test",
      sourceName: "Reuters",
      sourceDomain: "reuters.com",
      category: "ai-technology",
      summary: "OpenAI, NVIDIA, and AI chips remain central to generative AI expansion.",
      imageUrl: "https://images.example.com/a.jpg",
      publishedAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      language: "en",
      relevanceScore: 0,
      signalSummary: "",
      dedupeHash: "hash"
    },
    newsCategories[0]
  );

  assert.ok(result.score > 0.7);
  assert.match(result.signalSummary, /source|reporting|topic/i);
});
