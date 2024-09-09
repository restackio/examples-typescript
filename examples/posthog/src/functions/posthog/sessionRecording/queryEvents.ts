export type PosthogEvent = {
  uuid: string;
  event: string;
  timestamp: string;
  elements_chain: string;
  window_id?: string;
  current_url?: string;
  event_type?: string;
};

export async function posthogSessionEvents({
  recordingId,
  projectId,
  host,
  apiKey = process.env.POSTHOG_API_KEY,
}: {
  recordingId: string;
  projectId: string;
  host: string;
  apiKey?: string;
}): Promise<Event[]> {
  const url = `${host}/api/projects/${projectId}/query/`;
  const headers = {
    "content-type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

  const query = {
    kind: "EventsQuery",
    select: [
      "uuid",
      "event",
      "timestamp",
      "elements_chain",
      "properties.$window_id",
      "properties.$current_url",
      "properties.$event_type",
    ],
    orderBy: ["timestamp ASC"],
    limit: 1000000,
    properties: [
      {
        key: "$session_id",
        value: [recordingId],
        operator: "exact",
        type: "event",
      },
    ],
  };

  const payload = {
    query: query,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  // Remap the results to match the Event type
  return data.results.map(
    (result: any[]): PosthogEvent => ({
      uuid: result[0],
      event: result[1],
      timestamp: result[2],
      elements_chain: result[3],
      window_id: result[4],
      current_url: result[5],
      event_type: result[6],
    })
  );
}
