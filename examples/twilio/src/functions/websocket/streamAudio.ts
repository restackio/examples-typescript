import { EventEmitter } from "events";
import { v4 as uuidv4 } from "uuid";

class StreamAudio extends EventEmitter {
  private ws: any;
  private expectedAudioIndex: number;
  private audioBuffer: { [key: number]: string };
  private streamSid: string;

  constructor(websocket: any) {
    super();
    this.ws = websocket;
    this.expectedAudioIndex = 0;
    this.audioBuffer = {};
    this.streamSid = "";
  }

  setStreamSid(streamSid: string) {
    this.streamSid = streamSid;
  }

  buffer(index: number | null, audio: string) {
    if (index === null) {
      this.sendAudio(audio);
    } else if (index === this.expectedAudioIndex) {
      this.sendAudio(audio);
      this.expectedAudioIndex++;

      while (
        Object.prototype.hasOwnProperty.call(
          this.audioBuffer,
          this.expectedAudioIndex
        )
      ) {
        const bufferedAudio = this.audioBuffer[this.expectedAudioIndex];
        this.sendAudio(bufferedAudio);
        this.expectedAudioIndex++;
      }
    } else {
      this.audioBuffer[index] = audio;
    }
  }

  sendAudio(audio: string) {
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: "media",
        media: {
          payload: audio,
        },
      })
    );
    const markLabel = uuidv4();
    this.ws.send(
      JSON.stringify({
        streamSid: this.streamSid,
        event: "mark",
        mark: {
          name: markLabel,
        },
      })
    );
    this.emit("audiosent", markLabel);
  }
}

export { StreamAudio };
