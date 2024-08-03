import { EventEmitter } from "events";
import OpenAI from "openai";
import { tools } from "./tools/function-manifest";
import { log } from "@restackio/restack-sdk-ts/function";
import { prompt } from "./prompt";

const availableFunctions: { [key: string]: Function } = {};

tools?.forEach((tool) => {
  const functionName = tool.function.name;
  availableFunctions[functionName] = require(`../functions/${functionName}`);
});

interface GptReply {
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
    (this.userContext = prompt), (this.partialResponseIndex = 0);
  }

  setCallSid(callSid: string) {
    this.userContext.push({ role: "system", content: `callSid: ${callSid}` });
  }

  validateFunctionArgs(args: string) {
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

  updateUserContext(name: string, role: string, text: string) {
    if (name !== "user") {
      this.userContext.push({ role: role, name: name, content: text });
    } else {
      this.userContext.push({ role: role, content: text });
    }
  }

  async completion(
    text: string,
    interactionCount: number,
    role = "user",
    name = "user"
  ) {
    this.updateUserContext(name, role, text);

    const stream = await this.openai.chat.completions.create({
      model: "gpt-4o",
      messages: this.userContext,
      tools: tools,
      stream: true,
    });

    let completeResponse = "";
    let partialResponse = "";
    let functionName = "";
    let functionArgs = "";
    let finishReason = "";

    const collectToolInformation = (deltas: any) => {
      let name = deltas.tool_calls[0]?.function?.name || "";
      if (name != "") {
        functionName = name;
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
        const validatedArgs = this.validateFunctionArgs(functionArgs);

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

        this.updateUserContext(functionName, "function", functionResponse);

        await this.completion(
          functionResponse,
          interactionCount,
          "function",
          functionName
        );
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
    }
    this.userContext.push({ role: "assistant", content: completeResponse });

    const contextLength = this.userContext.length;
    log.info("GPT -> user context length:", { contextLength });
  }
}

export { OpenaiChat };
