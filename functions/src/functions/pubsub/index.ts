import * as functions from "firebase-functions";
import { postEntry, replyToPostPerText } from "../../services/bskyService";
import { FirestoreClient } from "../../clients/firestoreClient";
import { getSummaryFromUrl } from "../../services/openAIService";
import { getTargetEntry } from "../../services/hatenaService";

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

    // if (targetEntry["hatena:bookmarkcount"] < SUMMARY_POST_THRESHOLD) {
    //   return;
    // }

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
