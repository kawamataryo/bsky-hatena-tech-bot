import * as functions from "firebase-functions";
import { postEntry, replyToPostPerText } from "../../services/bskyService";
import { FirestoreClient } from "../../clients/firestoreClient";
import { getSummaryFromUrl } from "../../services/openAIService";
import { getTargetEntry } from "../../services/hatenaService";
import { SITES_WITHOUT_SUMMARY } from "../../constants";

const runtimeOpts = {
  timeoutSeconds: 240,
  memory: "1GB" as const,
};

// const SUMMARY_POST_THRESHOLD = 200;

export const postTrend = functions
  .runWith(runtimeOpts)
  .pubsub.schedule("every 1 hours")
  .onRun(async () => {
    const targetEntry = await getTargetEntry();
    const result = await postEntry(targetEntry);

    const firestoreClient = new FirestoreClient();
    await firestoreClient.insertPostedEntry(targetEntry);

    if (SITES_WITHOUT_SUMMARY.some((url) => targetEntry.link.startsWith(url))) {
      return;
    }

    try {
      const summary = await getSummaryFromUrl(targetEntry.link);
      await replyToPostPerText(summary, {
        cid: result.cid,
        uri: result.uri,
      });
      await firestoreClient.updatePostedEntry(targetEntry.link, summary);
    } catch (e) {
      console.error(e);
    }
  });
