import { defineEvent } from "@restackio/restack-sdk-ts/event";
import { WebsocketEvent } from "@restackio/integrations-websocket/types";

export type StreamInfo = {
  streamSid: string;
};

export type UserEvent = {
  message: string;
  userName?: string;
};

export const streamInfoEvent = defineEvent<StreamInfo>("streamInfo");

export const audioInEvent = defineEvent<WebsocketEvent>("audioIn");

export const userEvent = defineEvent<UserEvent>("user");

export const streamEndEvent = defineEvent("streamEnd");
