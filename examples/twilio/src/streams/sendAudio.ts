import { TrackName } from "../workflows/twilioStream";
import { webSocketConnect } from "./connect";

export async function sendAudio({
  streamSid,
  trackName,
  audio,
}: {
  streamSid: string;
  trackName: TrackName;
  audio: string;
}) {
  const ws = await webSocketConnect();

  const audioEvent = {
    streamSid: streamSid,
    event: "media",
    media: {
      trackName,
      payload: audio,
    },
  };
  ws.send(JSON.stringify(audioEvent));
  ws.close();
}
