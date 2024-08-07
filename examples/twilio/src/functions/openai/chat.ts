import { EventEmitter } from "events";
import OpenAI from "openai";
import { toolDefinitions } from "./tools/toolDefinitions";
import { log } from "@restackio/restack-sdk-ts/function";
import { agentPrompt } from "./prompt";
import checkInventory from "./tools/checkInventory";
import checkPrice from "./tools/checkPrice";
import placeOrder from "./tools/placeOrder";

const availableFunctions: { [key: string]: Function } = {
  checkInventory,
  checkPrice,
  placeOrder,
};

export interface GptReply {
  partialResponseIndex: number | null;
  partialResponse: string;
}

class OpenaiChat extends EventEmitter {
  private userContext: any[];
  private openai: OpenAI;
  private partialResponseIndex: number;
  private functionName: string;
  private functionArgs: string;

  constructor() {
    super();
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    (this.userContext = agentPrompt), (this.partialResponseIndex = 0);
    this.functionName = "";
    this.functionArgs = "";
  }

  setCallSid({ callSid }: { callSid: string }) {
    this.userContext.push({ role: "system", content: `callSid: ${callSid}` });
  }

  validateFunctionArgs({ args }: { args: string }) {
    try {
      return JSON.parse(args);
    } catch (error) {
      log.warn("Warning: Double function arguments returned by OpenAI:", {
        args,
      });
      if (args.indexOf("{") != args.lastIndexOf("{")) {
        return JSON.parse(
          args.substring(args.indexOf(""), args.indexOf("}") + 1)
        );
      }
    }
  }

  updateUserContext({
    name,
    role,
    text,
  }: {
    name: string;
    role: string;
    text: string;
  }) {
    if (name !== "user") {
      this.userContext.push({ role: role, name: name, content: text });
    } else {
      this.userContext.push({ role: role, content: text });
    }
  }

  async completion({
    text,
    interactionCount,
    role = "user",
    name = "user",
  }: {
    text: string;
    interactionCount: number;
    role?: string;
    name?: string;
  }) {
    this.updateUserContext({ name, role, text });

    const stream = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: this.userContext,
      tools: toolDefinitions,
      stream: true,
    });

    let completeResponse = "";
    let partialResponse = "";
    let finishReason = "";
    let toolsCalled: string[] = [];

    for await (const chunk of stream) {
      let content = chunk.choices[0]?.delta?.content || "";
      let deltas = chunk.choices[0]?.delta;
      finishReason = chunk.choices[0].finish_reason || "";

      // Accumulate function name and arguments if function_call
      if (deltas.tool_calls) {
        const functionCall = deltas.tool_calls[0];
        this.functionName += functionCall.function?.name || "";
        this.functionArgs += functionCall.function?.arguments || "";
      }

      if (finishReason === "tool_calls") {
        const functionToCall = availableFunctions[this.functionName];
        if (typeof functionToCall === "function") {
          const validatedArgs = this.validateFunctionArgs({
            args: this.functionArgs,
          });

          const toolData = toolDefinitions.find(
            (tool) => tool.function.name === this.functionName
          );

          this.emit(
            "gptreply",
            {
              partialResponseIndex: null,
              partialResponse: `let me ${toolData?.function.name}`,
            },
            interactionCount
          );

          let functionResponse = await functionToCall(validatedArgs);

          this.updateUserContext({
            name: this.functionName,
            role: "function",
            text: functionResponse,
          });

          await this.completion({
            text: functionResponse,
            interactionCount,
            role: "function",
            name: this.functionName,
          });

          toolsCalled.push(this.functionName);

          this.functionName = "";
          this.functionArgs = "";
        } else {
          log.error(
            `Function ${this.functionName} not found in availableFunctions.`
          );
        }
      } else {
        completeResponse += content;
        partialResponse += content;

        if (content.trim().slice(-1) === "•" || finishReason === "stop") {
          const gptReply: GptReply = {
            partialResponseIndex: this.partialResponseIndex,
            partialResponse,
          };
          this.emit("gptreply", gptReply, interactionCount);
          this.partialResponseIndex++;
          partialResponse = "";
        }
      }

      // Check if the stream is over
      if (finishReason === "stop") {
        this.emit("end", { completeResponse, interactionCount, toolsCalled });
        break;
      }
    }
    this.userContext.push({ role: "assistant", content: completeResponse });

    const contextLength = this.userContext.length;
    log.info("GPT -> user context length:", { contextLength });
  }
}

export { OpenaiChat };
