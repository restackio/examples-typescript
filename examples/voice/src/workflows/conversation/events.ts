import { defineEvent } from "@restackio/ai/event";
import {
  StreamEvent,
  ToolCallEvent,
} from "@restackio/integrations-openai/types";

export const streamEvent = defineEvent<StreamEvent>("stream");
export const toolCallEvent = defineEvent<ToolCallEvent>("toolCall");
export const conversationEndEvent = defineEvent("conversationEndEvent");
