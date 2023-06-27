import * as functions from "firebase-functions";
import { OpenAIClient } from "../clients/openAIClient";
import { timeoutPromise } from "../utils/utils";

export const getSummaryFromUrl = async (url: string): Promise<string> => {
  const openAIClient = new OpenAIClient(functions.config().openai.api_key);
  const summary = await Promise.race([
    openAIClient.summarize(url),
    timeoutPromise(230000),
  ]);
  if (summary && summary.length > 10) {
    return summary;
  } else {
    throw new Error("No summary found.");
  }
};
