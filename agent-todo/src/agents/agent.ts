import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
  childExecute,
<<<<<<< HEAD
  shouldContinueAsNew,
  agentContinueAsNew,
=======
  agentInfo,
>>>>>>> main
} from "@restackio/ai/agent";
import * as functions from "../functions";
import { executeTodoWorkflow } from "../workflows/executeTodo";
import { CreateTodoSchema, ExecuteTodoSchema } from "../functions/types";

export type EndEvent = {
  end: boolean;
};

export const messagesEvent = defineEvent<functions.Message[]>("messages");
export const endEvent = defineEvent("end");
export const createTodoEvent = defineEvent("createTodo");
export const executeTodoWorkflowEvent = defineEvent("executeTodoWorkflow");

type agentTodoOutput = {
  messages: functions.Message[];
};

export async function agentTodo(): Promise<agentTodoOutput | undefined> {
  let endReceived = false;
  let agentMessages: functions.Message[] = [];

  onEvent(messagesEvent, async ({ messages }: { messages: functions.Message[] }) => {
    agentMessages.push(...messages);

    const result = await step<typeof functions>({}).llmChat({
      messages: agentMessages,
      systemContent: "You are a helpful assistant that can create and execute todos.",
      model: "gpt-4.1-mini"
    });

    agentMessages.push(result);

    if (result.structured_data?.type === "function_call") {
      const { function_name, function_arguments } = result.structured_data;
      log.info(function_name, { function_arguments });

      switch (function_name) {
        case "createTodo":
          await step<typeof functions>({}).sendEvent({
            agentId: agentInfo().workflowId,
            runId: agentInfo().runId,
            eventName: "createTodo",
            eventInput: function_arguments
          });
          break;

        case "executeTodoWorkflow":
          const args = ExecuteTodoSchema.parse(function_arguments);
          await step<typeof functions>({}).sendEvent({
            agentId: agentInfo().workflowId,
            runId: agentInfo().runId,
            eventName: "executeTodoWorkflow",
            eventInput: { workflowId: `executeTodoWorkflow-${Date.now()}`, args }
          });
          break;
      }
    }

    return agentMessages;
  });

  onEvent(createTodoEvent, async (data: any) => {
    try {
      const parsedArgs = CreateTodoSchema.parse(data);
      const stepResult = await step<typeof functions>({}).createTodo(parsedArgs);

      await step<typeof functions>({}).sendEvent({
        agentId: agentInfo().workflowId,
        runId: agentInfo().runId,
        eventName: "messages",
        eventInput: {
          messages: [{
            role: "system",
            content: `Function executed: ${stepResult}`
          }]
        }
      });
    } catch (error: any) {
      log.error("Error in createTodo", { error: error.toString() });
      agentMessages.push({
        role: "system",
        content: `Error handling createTodo: ${error.message}`
      });
    }
  });

  onEvent(executeTodoWorkflowEvent, async (data: any) => {
    try {
      const { workflowId, args } = data;
      const workflowResult = await childExecute({
        child: executeTodoWorkflow,
        childId: workflowId,
        input: args,
        taskQueue: "todo-workflows"
      });

      await step<typeof functions>({}).sendEvent({
        agentId: agentInfo().workflowId,
        runId: agentInfo().runId,
        eventName: "messages",
        eventInput: {
          messages: [{
            role: "system",
            content: `Todo workflow executed successfully! Status: ${workflowResult.status} Details: ${workflowResult.details} ID: ${workflowResult.todoId}`
          }]
        }
      });
    } catch (workflowError: any) {
      log.error("Workflow execution failed", {
        error: workflowError.toString(),
        stack: workflowError.stack
      });

      agentMessages.push({
        role: "system",
        content: `The workflow execution failed: ${workflowError.message}`
      });
    }
  });

  onEvent(endEvent, async () => {
    endReceived = true;
  });

<<<<<<< HEAD
  await condition(() => endReceived || shouldContinueAsNew());

  if (endReceived) {
    log.info("end condition met");
    return { messages: agentMessages };
  }

  await agentContinueAsNew();
=======
  await condition(() => endReceived);
  log.info("end condition met");

  return { messages: agentMessages };
>>>>>>> main
}
