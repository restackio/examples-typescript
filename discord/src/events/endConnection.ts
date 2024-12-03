import { defineEvent } from "@restackio/ai/event";

export type EndConnectionEvent = {
  end: boolean;
};

export const endConnectionEvent = defineEvent<boolean>("endConnection");