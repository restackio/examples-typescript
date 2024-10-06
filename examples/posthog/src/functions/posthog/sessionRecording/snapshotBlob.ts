import { log } from "@restackio/ai/function";
import "dotenv/config";

export async function posthogGetSnapshotBlob({
  recordingId,
  blobKey,
  apiKey = process.env.POSTHOG_API_KEY,
  projectId,
  host,
}: {
  recordingId: string;
  blobKey: string;
  apiKey?: string;
  projectId: string;
  host: string;
}) {
  try {
    if (!apiKey) {
      throw new Error("Posthog personal api key missing");
    }

    const headers = { Authorization: `Bearer ${apiKey}` };
    const url = `${host}/api/projects/${projectId}/session_recordings/${recordingId}/snapshots?blob_key=${blobKey}&source=blob`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const result = await response.text();

    return result;
  } catch (error) {
    log.error("Encountered exception. ", { error });
    throw error;
  }
}
