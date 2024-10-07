import { log } from "@restackio/ai/function";
import "dotenv/config";

export type PosthogRecording = {
  id: string;
  distinct_id: string;
  viewed: boolean;
  recording_duration: number;
  active_seconds: number;
  inactive_seconds: number;
  start_time: string;
  end_time: string;
  click_count: number;
  keypress_count: number;
  mouse_activity_count: number;
  console_log_count: number;
  console_warn_count: number;
  console_error_count: number;
  start_url: string;
  person: {
    id: number;
    name: string;
    distinct_ids: string[];
    properties: any;
    created_at: string;
    uuid: string;
  };
  storage: string;
  snapshot_source: string;
};

type ApiResponse = {
  count: number;
  next: string | null;
  previous: string | null;
  results: PosthogRecording[];
};

export async function posthogGetRecordings({
  projectId,
  host,
  apiKey = process.env.POSTHOG_API_KEY,
}: {
  projectId: string;
  host: string;
  apiKey?: string;
}) {
  try {
    if (!apiKey) {
      throw new Error("Posthog personal api key missing");
    }

    const headers = { Authorization: `Bearer ${apiKey}` };
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);

    let url = `${host}/api/projects/${projectId}/session_recordings/`;
    let allResults: PosthogRecording[] = [];
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const result: ApiResponse = await response.json();
      const filteredResults = result.results.filter(
        (recording: PosthogRecording) =>
          new Date(recording.start_time) >= yesterday
      );

      allResults = allResults.concat(filteredResults);

      if (result.next && filteredResults.length === result.results.length) {
        url = result.next;
      } else {
        hasMore = false;
      }
    }

    return {
      count: allResults.length,
      results: allResults,
    };
  } catch (error) {
    log.error("Encountered exception. ", { error });
    throw error;
  }
}
