import { gotoHumanClient } from "./utils/client";

interface Input {
  topic: string;
  postDraft: string;
  workflowId: string;
  runId: string;
}

interface Output {
  reviewId: string;
}

export async function requestReview({topic, postDraft, workflowId, runId}: Input): Promise<Output> {
  const formId = process.env.GOTOHUMAN_FORM_ID
  if (!formId) {
    throw new Error("A form ID is required to request a review for a gotoHuman form.");
  }
  // Our gotoHuman review form contains dynamic components with the IDs 'topic' and 'linkedInPost'
  const gotoHuman = gotoHumanClient();
  const { reviewId } = await gotoHuman.createReview(formId)
    .addFieldData("topic", topic)
    .addFieldData("linkedInPost", postDraft)
    .addMetaData("restackWorkflowId", workflowId)
    .addMetaData("restackRunId", runId)
    .sendRequest()
  return { reviewId };
}
