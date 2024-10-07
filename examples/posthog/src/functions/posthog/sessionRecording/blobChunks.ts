import { functionInfo, log } from "@restackio/ai/function";
import "dotenv/config";
import { posthogGetSnapshotBlob } from "./snapshotBlob";
import Restack from "@restackio/ai";
import { chunkWorkflow } from "../../../workflows/chunk";

export async function posthogBlobChunks({
  recordingId,
  blobKeys,
  projectId,
  host,
  maxChunks = Infinity,
}: {
  recordingId: string;
  blobKeys: string[];
  projectId: string;
  host: string;
  maxChunks?: number;
}) {
  const { workflowExecution } = functionInfo();

  try {
    let recordingBlobs: string[] = [];
    const restack = new Restack();
    await Promise.all(
      blobKeys.map(async (blobKey) => {
        const recordingBlob = await posthogGetSnapshotBlob({
          recordingId,
          blobKey: blobKey,
          projectId,
          host,
        });
        recordingBlobs.push(recordingBlob);
      })
    );

    if (recordingBlobs.length === 0) {
      throw new Error("No recording blobs");
    }

    const maxCharacters = 20000;

    log.info("Recording blobs", {
      length: recordingBlobs.length,
      chunks: Math.ceil(recordingBlobs[0].length / maxCharacters),
    });

    const schedulePromises = recordingBlobs.map((blob, i) => {
      if (blob.length > maxCharacters) {
        const chunks = Math.min(
          Math.ceil(blob.length / maxCharacters),
          maxChunks
        ); // Limit chunks
        return Promise.all(
          Array.from({ length: chunks }, (_, j) => {
            const chunk = blob.slice(
              j * maxCharacters,
              (j + 1) * maxCharacters
            );
            return restack.scheduleWorkflow({
              workflowName: chunkWorkflow.name,
              workflowId: `${recordingId}-${i}-${j}-chunkWorkflow`,
              input: {
                recordingId,
                chunk,
                workflow: workflowExecution,
                isLastChunk: j === chunks - 1,
              },
            });
          })
        );
      } else {
        return restack.scheduleWorkflow({
          workflowName: chunkWorkflow.name,
          workflowId: `${recordingId}-${i}-0-chunkWorkflow`,
          input: {
            recordingId,
            chunk: JSON.stringify({
              recordingBlobs: [blob],
            }),
            workflow: workflowExecution,
            isLastChunk: true,
          },
        });
      }
    });

    await Promise.all(schedulePromises);

    return {
      recordingId,
      blobLength: recordingBlobs.length,
      blobchunks: Math.ceil(recordingBlobs[0].length / maxCharacters),
    };
  } catch (error) {
    log.error("Encountered exception. ", { error });
    throw error;
  }
}
