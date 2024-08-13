import { webSocketConnect } from "./connect";

export async function sendAudio({
  streamSid,
  audio,
}: {
  streamSid: string;
  audio: string;
}) {
  const ws = await webSocketConnect();

  const audioEvent = {
    streamSid: streamSid,
    event: "media",
    media: {
      payload: audio,
    },
  };
  ws.send(JSON.stringify(audioEvent));
  ws.close();
  return true;
}
