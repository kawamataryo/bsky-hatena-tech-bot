import Parser from "rss-parser";


export class HatenaClient {
  private RSS_URL = "https://b.hatena.ne.jp/hotentry/it.rss";

  async getHotEntries(): Promise<HatenaItem[]> {
    const parser = new Parser<any, HatenaItem>({
      customFields: {
        item: ["title", "link", "description", "hatena:bookmarkcount", "date", "hatena:bookmarkCommentListPageUrl"],
      },
    });
    const result = await parser.parseURL(this.RSS_URL);
    return result.items;
  }
}

(async () => {
  const client = new HatenaClient();
  const hotEntries = await client.getHotEntries();
  console.log(hotEntries);
})();
