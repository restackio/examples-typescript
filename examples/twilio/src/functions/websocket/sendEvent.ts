import { webSocketConnect } from "./connect";

export async function sendEvent({
  streamSid,
  eventName,
  data,
}: {
  streamSid: string;
  eventName: string;
  data: { text?: string };
}) {
  const ws = await webSocketConnect();

  const audioEvent = {
    streamSid: streamSid,
    event: eventName,
    data: data,
  };

  ws.send(JSON.stringify(audioEvent));
  ws.close();
  return true;
}
