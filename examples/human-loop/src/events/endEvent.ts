import { defineEvent } from "@restackio/ai/event";

export type EndEvent = {
  end: boolean;
};

export const endEvent = defineEvent<boolean>("end");
