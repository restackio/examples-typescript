import { defineEvent } from "@restackio/ai/event";

export type HumanResponseInput = {
  linkedInPost: string;
  publishDecision: string;
};

export const HumanResponseEvent = defineEvent<string>("humanResponseEvent");
