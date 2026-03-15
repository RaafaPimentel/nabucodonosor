import { NewsCategory } from "@/lib/types";

export const allowedDomainsByCategory: Record<NewsCategory["id"], string[]> = {
  "ai-technology": [
    "reuters.com",
    "bbc.com",
    "bloomberg.com",
    "ft.com",
    "economist.com",
    "apnews.com",
    "cnbc.com",
    "aljazeera.com",
    "techcrunch.com",
    "theverge.com",
    "wired.com",
    "arstechnica.com",
    "technologyreview.com",
    "venturebeat.com"
  ],
  programming: [
    "infoq.com",
    "thenewstack.io",
    "github.blog",
    "stackoverflow.blog",
    "martinfowler.com",
    "web.dev",
    "techcrunch.com",
    "theverge.com",
    "wired.com",
    "arstechnica.com"
  ],
  "global-economy": [
    "reuters.com",
    "bloomberg.com",
    "ft.com",
    "cnbc.com",
    "imf.org",
    "worldbank.org",
    "oecd.org",
    "economist.com",
    "apnews.com"
  ],
  gaming: [
    "ign.com",
    "gamespot.com",
    "polygon.com",
    "eurogamer.net",
    "pcgamer.com",
    "rockpapershotgun.com",
    "theverge.com",
    "reuters.com"
  ],
  "media-streaming": [
    "variety.com",
    "hollywoodreporter.com",
    "deadline.com",
    "semafor.com",
    "bloomberg.com",
    "reuters.com",
    "theverge.com",
    "wired.com"
  ]
};

export const newsCategories: NewsCategory[] = [
  {
    id: "ai-technology",
    name: "Artificial Intelligence & Technology",
    badge: "AI",
    description: "Models, chips, regulation, research, and the global AI race.",
    keywords: [
      "artificial intelligence",
      "generative AI",
      "LLM",
      "machine learning",
      "AI regulation",
      "NVIDIA",
      "OpenAI",
      "Anthropic",
      "AI chips",
      "AI startups"
    ],
    allowedDomains: allowedDomainsByCategory["ai-technology"]
  },
  {
    id: "programming",
    name: "Programming & Software Engineering",
    badge: "Code",
    description: "Languages, frameworks, developer tools, and modern software practice.",
    keywords: [
      "programming language",
      "JavaScript",
      "TypeScript",
      "Python",
      "Rust",
      "Go",
      "Java",
      "developer tools",
      "backend frameworks",
      "software engineering"
    ],
    allowedDomains: allowedDomainsByCategory.programming
  },
  {
    id: "global-economy",
    name: "Global Economy",
    badge: "Macro",
    description: "Inflation, rates, trade, markets, and the institutions moving capital.",
    keywords: [
      "global economy",
      "inflation",
      "central banks",
      "interest rates",
      "recession",
      "IMF",
      "world bank",
      "markets",
      "trade",
      "global finance"
    ],
    allowedDomains: allowedDomainsByCategory["global-economy"]
  },
  {
    id: "gaming",
    name: "Gaming Industry",
    badge: "Games",
    description: "Studios, hardware, releases, platform shifts, and interactive media business.",
    keywords: [
      "video games",
      "game industry",
      "PlayStation",
      "Xbox",
      "Nintendo",
      "Steam",
      "PC gaming",
      "esports",
      "game releases",
      "gaming studios"
    ],
    allowedDomains: allowedDomainsByCategory.gaming
  },
  {
    id: "media-streaming",
    name: "Media / Streaming / Entertainment Tech",
    badge: "Media",
    description: "Streaming strategy, digital distribution, virtual production, and media economics.",
    keywords: [
      "streaming industry",
      "media technology",
      "video platforms",
      "Netflix strategy",
      "Disney streaming",
      "AI filmmaking",
      "virtual production",
      "content platforms",
      "media economics",
      "Hollywood studios"
    ],
    allowedDomains: allowedDomainsByCategory["media-streaming"]
  }
];

export const credibilityWeights: Record<string, number> = {
  "reuters.com": 1,
  "bloomberg.com": 0.98,
  "ft.com": 0.96,
  "bbc.com": 0.95,
  "economist.com": 0.94,
  "apnews.com": 0.94,
  "cnbc.com": 0.92,
  "techcrunch.com": 0.9,
  "theverge.com": 0.88,
  "wired.com": 0.88,
  "arstechnica.com": 0.9,
  "technologyreview.com": 0.92,
  "venturebeat.com": 0.86,
  "infoq.com": 0.9,
  "thenewstack.io": 0.86,
  "github.blog": 0.9,
  "stackoverflow.blog": 0.85,
  "martinfowler.com": 0.9,
  "web.dev": 0.88,
  "ign.com": 0.84,
  "gamespot.com": 0.83,
  "polygon.com": 0.82,
  "eurogamer.net": 0.82,
  "pcgamer.com": 0.81,
  "rockpapershotgun.com": 0.8,
  "variety.com": 0.86,
  "hollywoodreporter.com": 0.84,
  "deadline.com": 0.82,
  "semafor.com": 0.8,
  "imf.org": 0.95,
  "worldbank.org": 0.95,
  "oecd.org": 0.94
};

export const allowedImageHosts = [
  "apnews.com",
  "assets.apnews.com",
  "dims.apnews.com",
  "assets.bwbx.io",
  "bbc.com",
  "bloomberg.com",
  "cnbcfm.com",
  "deadline.com",
  "economist.com",
  "eurogamer.net",
  "ft.com",
  "gamespot.com",
  "gnews.io",
  "hollywoodreporter.com",
  "i.insider.com",
  "ichef.bbci.co.uk",
  "ign.com",
  "image.cnbcfm.com",
  "media.wired.com",
  "images.ctfassets.net",
  "newsapi.org",
  "newscatcherapi.com",
  "pcgamer.com",
  "polygon.com",
  "res.infoq.com",
  "reuters.com",
  "rockpapershotgun.com",
  "static.reuters.com",
  "techcrunch.com",
  "theverge.com",
  "variety.com",
  "venturebeat.com",
  "vox-cdn.com",
  "wired.com",
  "www.reuters.com"
];
