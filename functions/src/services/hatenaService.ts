import { HatenaClient } from "./../clients/hatenaClient";
import { FirestoreClient } from "../clients/firestoreClient";

const MIN_BOOKMARK_COUNT = 100;
const HATENA_ANONYMOUS_URL = "https://anond.hatelabo.jp/";

const findValidStory = async (entries: HatenaItem[]) => {
  const fireStoreClient = new FirestoreClient();

  for (const entry of entries) {
    // 投稿済みを除外
    const isPostedEntry = await fireStoreClient.isPostedEntry(entry.link);
    if (isPostedEntry) {
      continue;
    }

    // 100ブクマ以下のエントリーを除外
    if (entry["hatena:bookmarkcount"] < MIN_BOOKMARK_COUNT) {
      continue;
    }

    // 匿名ユーザーのエントリーを除外
    if (entry.link.includes(HATENA_ANONYMOUS_URL)) {
      continue;
    }

    return entry;
  }
  throw new Error("No valid story found.");
};

export const getTargetEntry = async (): Promise<HatenaItem> => {
  const hatenaClient = new HatenaClient();
  const entries = await hatenaClient.getHotEntries();
  return await findValidStory(entries);
};
