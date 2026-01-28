
type HatenaItem = {
  title: string;
  link: string;
  description: string;
  "hatena:bookmarkcount": number;
  "hatena:bookmarkCommentListPageUrl": string;
  "hatena:imageurl": string;
  date: string;
}

type HackerNewsItem = {
  by: string;
  descendants: number;
  id: number;
  kids: number[];
  score: number;
  time: number;
  title: string;
  type: string;
  url?: string;
}

type HackerNewsItemWithTranslated = HackerNewsItem & {
  translatedTitle: string;
}

type OpenGraph = {
  url: string;
  type: string;
  description: string;
  title: string;
  uint8Array: Uint8Array;
};

type Secrets = {
  bsky: {
    identifier: string;
    password: string;
  };
  openai: {
    api_key: string;
  };
};
