import test from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { clusterCoverage, toDashboardArticle } from "@/lib/editorial";
import { NewsCategory, ArticleRecord } from "@/lib/types";

const aiCategory: NewsCategory = {
  id: "ai-technology",
  name: "Artificial Intelligence & Technology",
  badge: "AI",
  description: "AI coverage",
  keywords: ["ai", "openai", "nvidia"],
  allowedDomains: ["bbc.com", "bbc.co.uk", "techcrunch.com", "news.ycombinator.com"]
};

const programmingCategory: NewsCategory = {
  id: "programming",
  name: "Programming & Software Engineering",
  badge: "Code",
  description: "Programming coverage",
  keywords: ["javascript", "typescript", "framework", "developer"],
  allowedDomains: ["infoq.com", "github.blog", "web.dev"]
};

function article(overrides: Partial<ArticleRecord>): ArticleRecord {
  return {
    id: overrides.id ?? randomUUID(),
    title: overrides.title ?? "Default title",
    url: overrides.url ?? `https://example.com/${overrides.id ?? "story"}`,
    sourceName: overrides.sourceName ?? "Example",
    sourceDomain: overrides.sourceDomain ?? "example.com",
    category: overrides.category ?? "ai-technology",
    summary: overrides.summary ?? "",
    imageUrl: overrides.imageUrl ?? null,
    publishedAt: overrides.publishedAt ?? "2026-03-16T10:00:00.000Z",
    language: overrides.language ?? "en",
    relevanceScore: overrides.relevanceScore ?? 0.8,
    signalSummary: overrides.signalSummary ?? "high-confidence source • fresh reporting • 3 strong topic matches",
    dedupeHash: overrides.dedupeHash ?? randomUUID(),
    createdAt: overrides.createdAt ?? "2026-03-16T10:00:00.000Z",
    updatedAt: overrides.updatedAt ?? "2026-03-16T10:00:00.000Z"
  };
}

test("core source can replace related source as cluster lead", () => {
  const related = toDashboardArticle(
    article({
      id: "1",
      title: "GitHub launches new TypeScript framework tools for developers",
      sourceName: "GitHub Blog",
      sourceDomain: "github.blog"
    }),
    programmingCategory
  );
  const core = toDashboardArticle(
    article({
      id: "2",
      title: "GitHub launches TypeScript framework tooling for software developers",
      sourceName: "InfoQ",
      sourceDomain: "infoq.com",
      category: "programming",
      publishedAt: "2026-03-16T11:00:00.000Z"
    }),
    programmingCategory
  );

  const clustered = clusterCoverage([related, core]);

  assert.equal(clustered.length, 1);
  assert.equal(clustered[0].id, "2");
  assert.equal(clustered[0].relatedCoverage.length, 1);
  assert.equal(clustered[0].relatedCoverage[0].id, "1");
});

test("discussion source does not become a standalone homepage lead", () => {
  const discussion = toDashboardArticle(
    article({
      id: "3",
      title: "OpenAI roadmap reactions from developers",
      sourceName: "Hacker News",
      sourceDomain: "news.ycombinator.com"
    }),
    aiCategory
  );

  const clustered = clusterCoverage([discussion]);

  assert.equal(clustered.length, 0);
});

test("clustering does not merge weakly related stories with only two generic matches", () => {
  const left = toDashboardArticle(
    article({
      id: "4",
      title: "Microsoft expands AI tools for cloud customers",
      sourceName: "BBC Technology",
      sourceDomain: "bbc.co.uk"
    }),
    aiCategory
  );
  const right = toDashboardArticle(
    article({
      id: "5",
      title: "Microsoft launches AI chips for gaming consoles",
      sourceName: "TechCrunch",
      sourceDomain: "techcrunch.com",
      publishedAt: "2026-03-15T02:00:00.000Z"
    }),
    aiCategory
  );

  const clustered = clusterCoverage([left, right]);

  assert.equal(clustered.length, 2);
});
