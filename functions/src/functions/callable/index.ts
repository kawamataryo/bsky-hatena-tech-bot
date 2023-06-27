import * as functions from "firebase-functions";
import { postEntry, replyToPostPerText } from "../../services/bskyService";
import { FirestoreClient } from "../../clients/firestoreClient";
import { getSummaryFromUrl } from "../../services/openAIService";
import { getTargetEntry } from "../../services/hatenaService";

const runtimeOpts = {
  timeoutSeconds: 180,
  memory: "1GB" as const,
};

export const post = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (_req, res) => {
    const targetEntry = await getTargetEntry();
    const result = await postEntry(targetEntry);

    const firestoreClient = new FirestoreClient();
    await firestoreClient.insertPostedEntry(targetEntry);
    try {
      const summary = await getSummaryFromUrl(targetEntry.link);
      await replyToPostPerText(summary, {
        cid: result.cid,
        uri: result.uri,
      });
      await firestoreClient.updatePostedEntry(targetEntry.link, summary);
      res.send(`✅ success: ${summary}`);
    } catch (e) {
      console.error(e);
      res.send({
        body: `🚨 error: ${e}`,
        statusCode: 500,
      });
    }
  });
