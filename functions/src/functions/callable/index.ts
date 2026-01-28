import * as functions from "firebase-functions/v1";
import { postEntry, replyToPostPerText } from "../../services/bskyService";
import { FirestoreClient } from "../../clients/firestoreClient";
import { getSummaryFromUrl } from "../../services/openAIService";
import { getTargetEntry } from "../../services/hatenaService";
import { SECRETS } from "../../utils/firebaseConfig";

const runtimeOpts = {
  timeoutSeconds: 180,
  memory: "1GB" as const,
  secrets: [SECRETS],
};

export const post = functions
  .runWith(runtimeOpts)
  .https.onRequest(async (_req, res) => {
    const secrets = SECRETS.value();
    const targetEntry = await getTargetEntry();
    const result = await postEntry(targetEntry, secrets);

    const firestoreClient = new FirestoreClient();
    await firestoreClient.insertPostedEntry(targetEntry);
    try {
      const summary = await getSummaryFromUrl(targetEntry.link, secrets);
      await replyToPostPerText(summary, {
        cid: result.cid,
        uri: result.uri,
      }, secrets);
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
