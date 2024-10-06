import { log } from "@restackio/ai/function";
import "dotenv/config";

export type PosthogSnapshot = {
  source: "blob" | "realtime";
  start_timestamp: string;
  end_timestamp: string;
  blob_key: string;
};

export type ApiResponse = {
  sources: PosthogSnapshot[];
};

export async function posthogGetSnapshots({
  recordingId,
  apiKey = process.env.POSTHOG_API_KEY,
  projectId,
  host,
}: {
  recordingId: string;
  apiKey?: string;
  projectId: string;
  host: string;
}) {
  try {
    if (!apiKey) {
      throw new Error("Posthog personal api key missing");
    }

    const headers = { Authorization: `Bearer ${apiKey}` };
    const url = `${host}/api/projects/${projectId}/session_recordings/${recordingId}/snapshots`;

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const result: ApiResponse = await response.json();

    const blobKeys = result.sources
      .filter((source) => source.source === "blob" && source.blob_key)
      .map((source) => source.blob_key ?? "");

    log.info("blobKeys", { blobKeys });

    return {
      snapshots: result.sources,
      blobKeys: blobKeys,
    };
  } catch (error) {
    log.error("Encountered exception. ", { error });
    throw error;
  }
}
