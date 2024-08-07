import OpenAI from "openai";

// create metadata for all the available functions to pass to completions API
export const toolDefinitions: OpenAI.Chat.Completions.ChatCompletionTool[] = [
  {
    type: "function",
    function: {
      name: "checkInventory",
      description:
        "Check the inventory of airpods, airpods pro or airpods max.",
      parameters: {
        type: "object",
        properties: {
          model: {
            type: "string",
            enum: ["airpods", "airpods pro", "airpods max"],
            description:
              "The model of airpods, either the airpods, airpods pro or airpods max",
          },
        },
        required: ["model"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "checkPrice",
      description:
        "Check the price of given model of airpods, airpods pro or airpods max.",
      parameters: {
        type: "object",
        properties: {
          model: {
            type: "string",
            enum: ["airpods", "airpods pro", "airpods max"],
            description:
              "The model of airpods, either the airpods, airpods pro or airpods max",
          },
        },
        required: ["model"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "placeOrder",
      description: "Places an order for a set of airpods.",
      parameters: {
        type: "object",
        properties: {
          model: {
            type: "string",
            enum: ["airpods", "airpods pro"],
            description: "The model of airpods, either the regular or pro",
          },
          quantity: {
            type: "integer",
            description: "The number of airpods they want to order",
          },
        },
        required: ["type", "quantity"],
      },
    },
  },
];
