import { credibilityWeights } from "@/lib/config";
import { NewsCategory, NormalizedArticle, ScoreDetails } from "@/lib/types";

export function scoreArticle(article: NormalizedArticle, category: NewsCategory): ScoreDetails {
  const ageHours = Math.max(
    1,
    (Date.now() - new Date(article.publishedAt).getTime()) / (1000 * 60 * 60)
  );
  const recencyScore = Math.max(0, 1 - ageHours / 72);
  const keywordMatches = category.keywords.reduce((count, keyword) => {
    const haystack = `${article.title} ${article.summary}`.toLowerCase();
    return haystack.includes(keyword.toLowerCase()) ? count + 1 : count;
  }, 0);
  const keywordScore = Math.min(1, keywordMatches / Math.max(3, category.keywords.length / 2));
  const credibilityScore = credibilityWeights[article.sourceDomain] ?? 0.72;
  const imageScore = article.imageUrl ? 1 : 0.35;
  const specificityScore =
    article.title.split(" ").length <= 16 || article.summary.length <= 140 ? 0.85 : 0.65;
  const score = Number(
    (recencyScore * 0.35 + keywordScore * 0.3 + credibilityScore * 0.2 + imageScore * 0.08 + specificityScore * 0.07).toFixed(4)
  );

  const signals = [
    credibilityScore >= 0.9 ? "high-confidence source" : "reputable source",
    ageHours <= 8 ? "fresh reporting" : ageHours <= 24 ? "same-day coverage" : "recent coverage",
    keywordMatches >= 3 ? `${keywordMatches} strong topic matches` : `${Math.max(1, keywordMatches)} topic matches`
  ];

  if (article.imageUrl) {
    signals.push("rich media available");
  }

  return {
    score,
    signalSummary: signals.slice(0, 3).join(" • ")
  };
}
