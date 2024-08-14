import { websocketConnect } from "./connect";

export async function websocketSendAudio({
  streamSid,
  audio,
}: {
  streamSid: string;
  audio: string;
}) {
  const ws = await websocketConnect();

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
