import { defineEvent } from "@restackio/ai/event";

export type FeedbackEvent = {
  feedback: string;
};

export const feedbackEvent = defineEvent<string>("feedback");
