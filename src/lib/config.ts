import { FeedSource, NewsCategory, NewsCategoryGroup } from "@/lib/types";

export const allowedDomainsByCategory: Record<NewsCategory["id"], string[]> = {
  "ai-technology": [
    "reuters.com",
    "bbc.com",
    "bbc.co.uk",
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
    "bbc.co.uk",
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
  ],
  product: [
    "techcrunch.com",
    "theverge.com",
    "wired.com",
    "semafor.com",
    "bloomberg.com",
    "reuters.com",
    "ft.com",
    "martinfowler.com",
    "stripe.com"
  ],
  "devops-cloud": [
    "thenewstack.io",
    "infoq.com",
    "github.blog",
    "web.dev",
    "arstechnica.com",
    "technologyreview.com",
    "aws.amazon.com"
  ],
  "data-analytics": [
    "infoq.com",
    "thenewstack.io",
    "venturebeat.com",
    "technologyreview.com",
    "databricks.com",
    "snowflake.com",
    "mongodb.com"
  ],
  fintech: [
    "reuters.com",
    "bloomberg.com",
    "ft.com",
    "cnbc.com",
    "techcrunch.com",
    "stripe.com",
    "block.xyz",
    "visa.com",
    "mastercard.com"
  ],
  "crypto-digital-assets": [
    "reuters.com",
    "bloomberg.com",
    "ft.com",
    "cnbc.com",
    "coindesk.com",
    "cointelegraph.com",
    "blog.coinbase.com",
    "circle.com",
    "stripe.com"
  ]
};

export const feedSources: FeedSource[] = [
  {
    id: "bbc-technology",
    name: "BBC Technology",
    siteUrl: "https://www.bbc.com/news/technology",
    feedUrl: "https://feeds.bbci.co.uk/news/technology/rss.xml",
    format: "rss",
    categoryIds: ["ai-technology"],
    language: "en",
    credibilityWeight: 0.95,
    enabled: true
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    siteUrl: "https://techcrunch.com",
    feedUrl: "https://techcrunch.com/feed/",
    format: "rss",
    categoryIds: ["ai-technology", "product", "fintech"],
    language: "en",
    credibilityWeight: 0.9,
    enabled: true
  },
  {
    id: "ars-technica",
    name: "Ars Technica",
    siteUrl: "https://arstechnica.com",
    feedUrl: "https://feeds.arstechnica.com/arstechnica/index",
    format: "rss",
    categoryIds: ["ai-technology"],
    language: "en",
    credibilityWeight: 0.9,
    enabled: true
  },
  {
    id: "infoq",
    name: "InfoQ",
    siteUrl: "https://www.infoq.com",
    feedUrl: "https://feed.infoq.com/",
    format: "rss",
    categoryIds: ["programming", "devops-cloud", "data-analytics"],
    language: "en",
    credibilityWeight: 0.9,
    enabled: true
  },
  {
    id: "github-blog",
    name: "GitHub Blog",
    siteUrl: "https://github.blog",
    feedUrl: "https://github.blog/feed/",
    format: "rss",
    categoryIds: ["programming", "devops-cloud"],
    language: "en",
    credibilityWeight: 0.9,
    enabled: true
  },
  {
    id: "web-dev",
    name: "web.dev",
    siteUrl: "https://web.dev",
    feedUrl: "https://web.dev/feed.xml",
    format: "rss",
    categoryIds: ["programming", "product"],
    language: "en",
    credibilityWeight: 0.88,
    enabled: true
  },
  {
    id: "bbc-business",
    name: "BBC Business",
    siteUrl: "https://www.bbc.com/news/business",
    feedUrl: "https://feeds.bbci.co.uk/news/business/rss.xml",
    format: "rss",
    categoryIds: ["global-economy"],
    language: "en",
    credibilityWeight: 0.95,
    enabled: true
  },
  {
    id: "cnbc-business",
    name: "CNBC Business",
    siteUrl: "https://www.cnbc.com/business/",
    feedUrl: "https://www.cnbc.com/id/10001147/device/rss/rss.html",
    format: "rss",
    categoryIds: ["global-economy"],
    language: "en",
    credibilityWeight: 0.92,
    enabled: true
  },
  {
    id: "gamespot",
    name: "GameSpot",
    siteUrl: "https://www.gamespot.com",
    feedUrl: "https://www.gamespot.com/feeds/mashup/",
    format: "rss",
    categoryIds: ["gaming"],
    language: "en",
    credibilityWeight: 0.83,
    enabled: true
  },
  {
    id: "polygon",
    name: "Polygon",
    siteUrl: "https://www.polygon.com",
    feedUrl: "https://www.polygon.com/rss/index.xml",
    format: "rss",
    categoryIds: ["gaming"],
    language: "en",
    credibilityWeight: 0.82,
    enabled: true
  },
  {
    id: "pc-gamer",
    name: "PC Gamer",
    siteUrl: "https://www.pcgamer.com",
    feedUrl: "https://www.pcgamer.com/feeds.xml",
    format: "rss",
    categoryIds: ["gaming"],
    language: "en",
    credibilityWeight: 0.81,
    enabled: true
  },
  {
    id: "variety",
    name: "Variety",
    siteUrl: "https://variety.com",
    feedUrl: "https://variety.com/feed/",
    format: "rss",
    categoryIds: ["media-streaming"],
    language: "en",
    credibilityWeight: 0.86,
    enabled: true
  },
  {
    id: "deadline",
    name: "Deadline",
    siteUrl: "https://deadline.com",
    feedUrl: "https://deadline.com/feed/",
    format: "rss",
    categoryIds: ["media-streaming"],
    language: "en",
    credibilityWeight: 0.82,
    enabled: true
  },
  {
    id: "hollywood-reporter",
    name: "The Hollywood Reporter",
    siteUrl: "https://www.hollywoodreporter.com",
    feedUrl: "https://www.hollywoodreporter.com/feed/",
    format: "rss",
    categoryIds: ["media-streaming"],
    language: "en",
    credibilityWeight: 0.84,
    enabled: true
  },
  {
    id: "martin-fowler",
    name: "Martin Fowler",
    siteUrl: "https://martinfowler.com",
    feedUrl: "https://martinfowler.com/feed.atom",
    format: "atom",
    categoryIds: ["product"],
    language: "en",
    credibilityWeight: 0.9,
    enabled: true
  },
  {
    id: "stripe-blog",
    name: "Stripe Blog",
    siteUrl: "https://stripe.com/blog",
    feedUrl: "https://stripe.com/blog/feed.rss",
    format: "rss",
    categoryIds: ["product", "fintech", "crypto-digital-assets"],
    language: "en",
    credibilityWeight: 0.87,
    enabled: true
  },
  {
    id: "the-new-stack",
    name: "The New Stack",
    siteUrl: "https://thenewstack.io",
    feedUrl: "https://thenewstack.io/feed/",
    format: "rss",
    categoryIds: ["devops-cloud", "data-analytics"],
    language: "en",
    credibilityWeight: 0.86,
    enabled: true
  },
  {
    id: "aws-blog",
    name: "AWS Blog",
    siteUrl: "https://aws.amazon.com/blogs",
    feedUrl: "https://aws.amazon.com/blogs/aws/feed/",
    format: "rss",
    categoryIds: ["devops-cloud"],
    language: "en",
    credibilityWeight: 0.84,
    enabled: true
  },
  {
    id: "databricks-blog",
    name: "Databricks Blog",
    siteUrl: "https://www.databricks.com/blog",
    feedUrl: "https://www.databricks.com/blog/feed",
    format: "rss",
    categoryIds: ["data-analytics"],
    language: "en",
    credibilityWeight: 0.85,
    enabled: false
  },
  {
    id: "coindesk",
    name: "CoinDesk",
    siteUrl: "https://www.coindesk.com",
    feedUrl: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    format: "rss",
    categoryIds: ["crypto-digital-assets"],
    language: "en",
    credibilityWeight: 0.8,
    enabled: true
  },
  {
    id: "coinbase-blog",
    name: "Coinbase Blog",
    siteUrl: "https://blog.coinbase.com",
    feedUrl: "https://blog.coinbase.com/feed",
    format: "rss",
    categoryIds: ["crypto-digital-assets", "fintech"],
    language: "en",
    credibilityWeight: 0.84,
    enabled: false
  }
];

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
  },
  {
    id: "product",
    name: "Product",
    badge: "Product",
    description: "Platform strategy, monetization, launches, bundling, and product-led shifts shaping the software market.",
    keywords: [
      "product strategy",
      "SaaS pricing",
      "platform strategy",
      "app monetization",
      "product launch",
      "subscription business",
      "growth product",
      "roadmap",
      "feature rollout",
      "marketplace strategy"
    ],
    allowedDomains: allowedDomainsByCategory.product
  },
  {
    id: "devops-cloud",
    name: "DevOps & Cloud",
    badge: "Cloud",
    description: "Infrastructure, platform engineering, observability, SRE, and the systems running modern software.",
    keywords: [
      "DevOps",
      "platform engineering",
      "Kubernetes",
      "cloud infrastructure",
      "AWS",
      "Azure",
      "Google Cloud",
      "observability",
      "CI/CD",
      "SRE"
    ],
    allowedDomains: allowedDomainsByCategory["devops-cloud"]
  },
  {
    id: "data-analytics",
    name: "Data & Analytics",
    badge: "Data",
    description: "Data platforms, analytics stacks, warehouses, vector systems, and governance moving enterprise intelligence.",
    keywords: [
      "data engineering",
      "data platform",
      "analytics",
      "data warehouse",
      "Snowflake",
      "Databricks",
      "vector database",
      "ETL",
      "data governance",
      "business intelligence"
    ],
    allowedDomains: allowedDomainsByCategory["data-analytics"]
  },
  {
    id: "fintech",
    name: "Fintech",
    badge: "Fintech",
    description: "Payments, digital banking, financial infrastructure, and the companies rebuilding money movement online.",
    keywords: [
      "fintech",
      "digital banking",
      "payments",
      "Stripe",
      "Adyen",
      "Block",
      "Visa",
      "Mastercard",
      "embedded finance",
      "fintech regulation"
    ],
    allowedDomains: allowedDomainsByCategory.fintech
  },
  {
    id: "crypto-digital-assets",
    name: "Crypto & Digital Assets",
    badge: "Assets",
    description: "Bitcoin, stablecoins, regulation, tokenization, exchanges, and digital-asset infrastructure with real market impact.",
    keywords: [
      "bitcoin",
      "ethereum",
      "stablecoins",
      "digital assets",
      "crypto regulation",
      "spot bitcoin ETF",
      "exchange",
      "custody",
      "tokenization",
      "blockchain infrastructure"
    ],
    allowedDomains: allowedDomainsByCategory["crypto-digital-assets"]
  }
];

export const newsCategoryGroups: NewsCategoryGroup[] = [
  {
    id: "core-coverage",
    name: "Core Coverage",
    description: "The original editorial spine of Oraculum across AI, software, macro, gaming, and media platforms.",
    categoryIds: ["ai-technology", "programming", "global-economy", "gaming", "media-streaming"]
  },
  {
    id: "market-intelligence",
    name: "Market Intelligence",
    description: "Product strategy, financial infrastructure, and digital-asset shifts shaping how technology is commercialized.",
    categoryIds: ["product", "fintech", "crypto-digital-assets"]
  },
  {
    id: "builder-stack",
    name: "Builder Stack",
    description: "The operational and data foundations teams rely on to ship and scale modern software.",
    categoryIds: ["devops-cloud", "data-analytics"]
  }
];

export const credibilityWeights: Record<string, number> = {
  "reuters.com": 1,
  "bloomberg.com": 0.98,
  "ft.com": 0.96,
  "bbc.com": 0.95,
  "bbc.co.uk": 0.95,
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
  "aws.amazon.com": 0.84,
  "block.xyz": 0.83,
  "blog.coinbase.com": 0.84,
  "circle.com": 0.82,
  "coindesk.com": 0.8,
  "cointelegraph.com": 0.72,
  "databricks.com": 0.85,
  "ign.com": 0.84,
  "gamespot.com": 0.83,
  "polygon.com": 0.82,
  "eurogamer.net": 0.82,
  "mastercard.com": 0.82,
  "mongodb.com": 0.8,
  "pcgamer.com": 0.81,
  "rockpapershotgun.com": 0.8,
  "snowflake.com": 0.84,
  "stripe.com": 0.87,
  "variety.com": 0.86,
  "hollywoodreporter.com": 0.84,
  "deadline.com": 0.82,
  "semafor.com": 0.8,
  "imf.org": 0.95,
  "visa.com": 0.82,
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
  "assets-prd.ignimgs.com",
  "image.cnbcfm.com",
  "media.wired.com",
  "images.ctfassets.net",
  "cdn.mos.cms.futurecdn.net",
  "images.stripeassets.com",
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
  "thenewstack.io",
  "variety.com",
  "venturebeat.com",
  "vox-cdn.com",
  "wired.com",
  "www.reuters.com"
];
