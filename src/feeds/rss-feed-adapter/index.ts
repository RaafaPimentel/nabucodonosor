import { BaseFeedAdapter } from "@/feeds/base";
import { FeedSource } from "@/lib/types";
import { parseFeedXml } from "@/lib/utils/feed";

export class RssFeedAdapter extends BaseFeedAdapter {
  readonly name = "rss-official-feeds";

  async getFeedItems(source: FeedSource, limit: number) {
    const xml = await this.requestText(source.feedUrl);
    return parseFeedXml(xml, source).slice(0, limit);
  }
}
