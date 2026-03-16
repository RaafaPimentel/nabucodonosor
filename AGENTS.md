# Oraculum Agents

This file documents the application agents used in Oraculum and the planned RSS-first ingestion split for the MVP.

## Purpose

Agents are small, focused orchestration units in the news pipeline. They should stay stateless, reusable, and easy to compose inside jobs and internal APIs.

The frontend must remain decoupled from ingestion. It reads from Oraculum's own database and internal API layer only.

## Current Core Agents

### `NewsIngestionAgent`

Path:
- [src/agents/ingestion-agent/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/agents/ingestion-agent/index.ts)

Responsibility:
- fetch articles from provider adapters
- isolate provider failures
- return raw provider items plus failure details

Input:
- provider adapters
- editorial category
- per-provider fetch limit

Output:
- raw provider article list
- provider failure list

### `ContentProcessingAgent`

Path:
- [src/agents/processing-agent/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/agents/processing-agent/index.ts)

Responsibility:
- normalize raw input into the internal article format
- filter low-quality or off-policy content
- deduplicate accepted articles

Input:
- editorial category
- raw articles

Output:
- normalized deduplicated articles

### `NewsRankingAgent`

Path:
- [src/agents/ranking-agent/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/agents/ranking-agent/index.ts)

Responsibility:
- calculate relevance score
- attach signal summary
- sort articles for persistence and homepage use

Input:
- editorial category
- normalized articles

Output:
- ranked articles

## RSS-First Agents

These agents were added to support the migration away from paid-news-provider dependence for the MVP.

### `SourceRegistryAgent`

Path:
- [src/agents/source-registry-agent/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/agents/source-registry-agent/index.ts)

Responsibility:
- own the enabled feed source registry
- filter sources by category
- expose source metadata for ingestion and observability

Input:
- feed source definitions

Output:
- enabled sources
- category-specific source lists
- source lookup by id

### `FeedIngestionAgent`

Path:
- [src/agents/feed-ingestion-agent/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/agents/feed-ingestion-agent/index.ts)

Responsibility:
- fetch RSS/Atom items source by source
- isolate source failures
- return grouped feed items for downstream processing

Input:
- feed adapter
- source list
- per-source fetch limit

Output:
- feed items grouped by source id
- fetch failure list

### `ClassificationAgent`

Path:
- [src/agents/classification-agent/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/agents/classification-agent/index.ts)

Responsibility:
- classify feed items into editorial categories
- support cross-category matches for intelligence tags and later ranking inputs

Input:
- feed items
- configured categories

Output:
- primary category
- matched category list

### `FeedHealthAgent`

Path:
- [src/agents/feed-health-agent/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/agents/feed-health-agent/index.ts)

Responsibility:
- summarize source-level feed quality
- provide source health snapshots for admin and diagnostics later

Input:
- source list
- fetched counts
- accepted counts
- failures

Output:
- source health summary list

## Shared Skills

### `normalize-article`

Path:
- [src/skills/normalize-article/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/skills/normalize-article/index.ts)

Responsibility:
- convert source/provider-specific items into the internal article shape

### `dedupe-articles`

Path:
- [src/skills/dedupe-articles/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/skills/dedupe-articles/index.ts)

Responsibility:
- remove duplicate articles using canonical URL and normalized title hash

### `score-article`

Path:
- [src/skills/score-article/index.ts](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/src/skills/score-article/index.ts)

Responsibility:
- calculate recency, credibility, and keyword relevance score

## Recommended Execution Order

Current provider-based path:
1. `NewsIngestionAgent`
2. `ContentProcessingAgent`
3. `NewsRankingAgent`
4. DB persistence

Planned RSS-first path:
1. `SourceRegistryAgent`
2. `FeedIngestionAgent`
3. `ClassificationAgent`
4. `ContentProcessingAgent`
5. `NewsRankingAgent`
6. `FeedHealthAgent`
7. DB persistence

## Design Rules

- Agents must stay stateless.
- Agents must not depend on UI components.
- Frontend code must never call third-party news sources directly.
- All ingestion output must be normalized into the internal article format before ranking and storage.
- Feed sources and paid APIs should both be treated as adapters behind stable internal interfaces.
- Paid APIs are optional extensions, not required core dependencies for the MVP.
- Feed sources should be categorized by tier:
  - `core`: primary editorial sources used for main coverage
  - `related`: secondary coverage used to enrich story clusters
  - `discussion`: optional community/commentary sources kept off by default

## Related Docs

- [docs/rss-agent-migration.md](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/docs/rss-agent-migration.md)
- [README.md](/mnt/c/Users/RFEF3Q/Documents/nabucodonosor/README.md)
