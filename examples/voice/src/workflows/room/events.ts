import { defineEvent } from "@restackio/ai/event";
import { WebsocketEvent } from "@restackio/integrations-websocket/types";

export type RoomInfo = {
  streamSid: string;
};

export type UserEvent = {
  message: string;
  userName?: string;
};

export type RoomMessageEvent = {
  trackId: string;
  text: string;
};

export const streamInfoEvent = defineEvent<RoomInfo>("streamInfo");

export const audioInEvent = defineEvent<WebsocketEvent>("audioIn");

export const userEvent = defineEvent<UserEvent>("userMessage");

export const roomMessageEvent = defineEvent<RoomMessageEvent>("roomMessage");

export const streamEndEvent = defineEvent("streamEnd");
