import { defineEvent } from "@restackio/ai/event";

export type MessageCreatedEvent = {
  content: string;
  id: string;
};

export const messageCreatedEvent = defineEvent<string>("messageCreated");