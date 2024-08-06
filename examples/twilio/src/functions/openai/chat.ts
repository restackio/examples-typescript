import { EventEmitter } from "events";
import OpenAI from "openai";
import { tools } from "./tools/function-manifest";
import { log } from "@restackio/restack-sdk-ts/function";
import { agentPrompt } from "./prompt";

const availableFunctions: { [key: string]: Function } = {};

tools?.forEach((tool) => {
  const functionName = tool.function.name;
  availableFunctions[functionName] = require(`./tools/${functionName}`);
});

export interface GptReply {
  partialResponseIndex: number | null;
  partialResponse: string;
}

class OpenaiChat extends EventEmitter {
  private userContext: any[];
  private openai: any;
  private partialResponseIndex: number;

  constructor() {
    super();
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    (this.userContext = agentPrompt), (this.partialResponseIndex = 0);
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
      tools: tools,
      stream: true,
    });

    let completeResponse = "";
    let partialResponse = "";
    let functionName = "";
    let functionArgs = "";
    let finishReason = "";
    const toolsCalled: string[] = [];

    const collectToolInformation = (deltas: any) => {
      let name = deltas.tool_calls[0]?.function?.name || "";
      if (name != "") {
        functionName = name;
        if (!toolsCalled.includes(name)) {
          toolsCalled.push(name);
        }
      }
      let args = deltas.tool_calls[0]?.function?.arguments || "";
      if (args != "") {
        functionArgs += args;
      }
    };

    for await (const chunk of stream) {
      let content = chunk.choices[0]?.delta?.content || "";
      let deltas = chunk.choices[0].delta;
      finishReason = chunk.choices[0].finish_reason;

      if (deltas.tool_calls) {
        collectToolInformation(deltas);
      }

      if (finishReason === "tool_calls") {
        const functionToCall = availableFunctions[functionName];
        const validatedArgs = this.validateFunctionArgs({ args: functionArgs });

        const toolData = tools.find(
          (tool) => tool.function.name === functionName
        );
        const say = toolData?.function.say;

        this.emit(
          "gptreply",
          {
            partialResponseIndex: null,
            partialResponse: say,
          },
          interactionCount
        );

        let functionResponse = await functionToCall(validatedArgs);

        this.updateUserContext({
          name: functionName,
          role: "function",
          text: functionResponse,
        });

        await this.completion({
          text: functionResponse,
          interactionCount,
          role: "function",
          name: functionName,
        });
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
