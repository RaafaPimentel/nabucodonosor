import test from "node:test";
import assert from "node:assert/strict";
import { parseFeedXml } from "@/lib/utils/feed";
import { FeedSource } from "@/lib/types";

const source: FeedSource = {
  id: "test-source",
  name: "Test Source",
  siteUrl: "https://example.com",
  feedUrl: "https://example.com/feed.xml",
  format: "rss",
  categoryIds: ["ai-technology"],
  language: "en",
  credibilityWeight: 0.9,
  enabled: true
};

test("parseFeedXml parses RSS item content", () => {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/">
      <channel>
        <title>Example Feed</title>
        <item>
          <title><![CDATA[Test headline]]></title>
          <link>https://example.com/story</link>
          <guid>story-1</guid>
          <description><![CDATA[<p>Summary here.</p><img src="https://example.com/image.jpg" />]]></description>
          <pubDate>Mon, 16 Mar 2026 10:00:00 GMT</pubDate>
          <category>AI</category>
        </item>
      </channel>
    </rss>`;

  const items = parseFeedXml(xml, source);

  assert.equal(items.length, 1);
  assert.equal(items[0].title, "Test headline");
  assert.equal(items[0].url, "https://example.com/story");
  assert.equal(items[0].guid, "story-1");
  assert.equal(items[0].description, "Summary here.");
  assert.equal(items[0].imageUrl, "https://example.com/image.jpg");
  assert.equal(items[0].sourceName, "Test Source");
  assert.deepEqual(items[0].categories, ["AI"]);
});
