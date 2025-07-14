import {
  defineEvent,
  onEvent,
  condition,
  log,
  step,
  childExecute,
  uuid,
  AgentError,
  agentInfo,
  sleep,
  shouldContinueAsNew,
  agentContinueAsNew,
} from "@restackio/ai/agent";
import { nextEvent, getFlow } from "@restackio/ai/flow";
import { Workflow } from "@temporalio/workflow";
import * as flowFunctions from "@restackio/ai/flow";
import * as functions from "../functions";

export type EndEvent = {
  end: boolean;
};

export const endEvent = defineEvent("end");

export type FlowEvent = {
  name: string;
  input: any;
};

export const flowEvent = defineEvent<FlowEvent>("flowEvent");

export type AgentFlowInput = {
  flowJson: any;
}

export type AgentFlowOutput = {
  results: {
    id: string;
    status: "running" | "completed" | 'error'
    input: any;
    rawResponse: any;
    response: any;
  }[];
}
export async function agentFlow({flowJson}: AgentFlowInput): Promise<AgentFlowOutput | undefined> {
  let endReceived = false;
  const eventResults: AgentFlowOutput['results'] = []

  try {

    if (!flowJson) {

      // Mock React Flow JSON to debug with frontend

      flowJson = await step<typeof functions>({}).mockFlow();
    }

    const {flowMap} = await step<typeof flowFunctions>({}).dslInterpreter({
      reactflowJson: flowJson,
    });

    onEvent(flowEvent, async ({ name, input }: FlowEvent) => {
      log.info(`Received event: ${name}`);
      log.info(`Received event data: ${input}`);
      const flow = getFlow({flowMap, name})

      if (!flow) {
        throw new AgentError(`No workflow found for event: ${name}`);
      }

      const childOutput = await childExecute({
        child: flow.workflowType as unknown as Workflow,
        childId: uuid(),
        input: {
          eventData: input,
          flow: {
            prompt: flow.flowPrompt,
            outputConditions: flow.flowOutputConditions,
          },
        },
        taskQueue: "workflow",
      });

      eventResults.push({
        id: name,
        status: "completed",
        input: input,
        rawResponse: childOutput.rawResponse,
        response: childOutput.response,
      });

      const nextFlowEvent = nextEvent({flow, childOutput});

      if (nextFlowEvent) {

        await sleep(1000);
        step<typeof functions>({}).sendAgentEvent({
          eventName: 'flowEvent',
          eventInput: {
            name: nextFlowEvent.eventName,
            input: childOutput.response,
          },
          agentId: agentInfo().workflowId,
          runId: agentInfo().runId,
        });
      }
      return {
        ...childOutput,
        nextEvent: nextFlowEvent?.eventName,
      }

    });

    onEvent(endEvent, async () => {
      await sleep(2000);
      endReceived = true;
    });

    await condition(() => endReceived || shouldContinueAsNew());

    if (endReceived) {
      log.info("end condition met");
      return {
        results: eventResults,
      };
    }
    await agentContinueAsNew();
  } catch (error) {
    throw new AgentError("Error in agentFlow", error as string);
  }
}

