import { NewsCategory, NormalizedArticle } from "@/lib/types";
import { scoreArticle } from "@/skills/score-article";

export class NewsRankingAgent {
  run(input: { category: NewsCategory; articles: NormalizedArticle[] }) {
    return input.articles
      .map((article) => {
        const score = scoreArticle(article, input.category);

        return {
          ...article,
          relevanceScore: score.score,
          signalSummary: score.signalSummary
        };
      })
      .sort((left, right) => {
        if (right.relevanceScore !== left.relevanceScore) {
          return right.relevanceScore - left.relevanceScore;
        }

        return new Date(right.publishedAt).getTime() - new Date(left.publishedAt).getTime();
      });
  }
}
