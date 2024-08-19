import { defineEvent } from "@restackio/restack-sdk-ts/event";
import {
  StreamEvent,
  ToolCallEvent,
} from "@restackio/integrations-openai/types";

export const assistantEvent = defineEvent<StreamEvent>("assistant");
export const toolCallEvent = defineEvent<ToolCallEvent>("toolCall");
export const agentEnd = defineEvent("agentEnd");
