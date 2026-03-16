# RSS-First Agent Split

This document defines the migration path from provider-based news APIs to an RSS/Atom-first ingestion model for the MVP.

## Goal

Move Oraculum to official feeds as the primary ingestion method while keeping the frontend, editorial ranking, and internal API backed by the database.

Paid news APIs remain optional future adapters, not core dependencies.

## Agent Split

### 1. Source Registry Agent

Responsibility:
- Own the list of enabled feed sources
- Filter sources by category
- Expose source metadata for sync and observability

Inputs:
- feed registry configuration

Outputs:
- enabled sources
- category-scoped source lists

### 2. Feed Ingestion Agent

Responsibility:
- Fetch RSS/Atom items source by source through a feed adapter
- Isolate source failures so one broken feed does not stop the sync

Inputs:
- feed adapter
- source list
- limit per source

Outputs:
- items grouped by source
- source fetch failures

### 3. Classification Agent

Responsibility:
- Map feed items to editorial categories using internal keyword logic
- Support cross-category matching for later intelligence tags

Inputs:
- feed items
- configured categories

Outputs:
- primary category
- secondary category matches

### 4. Content Processing Agent

Responsibility:
- Normalize source-specific items into the internal article format
- Clean URLs, text, language, and images
- Deduplicate internally

Inputs:
- feed items
- category context

Outputs:
- normalized unique articles

### 5. News Ranking Agent

Responsibility:
- Apply credibility, recency, and keyword scoring
- Order stored articles for the homepage and internal API

Inputs:
- normalized articles
- category context

Outputs:
- ranked articles

### 6. Feed Health Agent

Responsibility:
- Summarize source-level sync quality
- Surface broken, stale, or low-yield feeds in admin later

Inputs:
- source list
- fetched counts
- accepted counts
- failures

Outputs:
- per-source health snapshots

## Migration Sequence

1. Introduce feed source definitions and feed adapter contracts.
2. Add an RSS/Atom adapter using the new ingestion agent.
3. Move source configuration from provider-centric config to a feed registry.
4. Switch the sync job from provider loops to source-registry + feed ingestion orchestration.
5. Keep the existing processing, ranking, DB storage, and frontend read path.
6. Reintroduce paid APIs later as optional adapters that implement the same normalized ingestion boundary.

## Why This Split

- Keeps source management explicit instead of hard-coding behavior into one sync job.
- Makes RSS migration incremental and low-risk.
- Preserves the editorial and database layers that already exist.
- Allows future source-level health views and internal admin controls.
