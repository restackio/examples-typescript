import { z } from "zod";
import { zodFunction } from "openai/helpers/zod";

export const toolInput = z.object({
  model: z
    .enum(["airpods", "airpods pro", "airpods max"])
    .describe(
      "The model of airpods, either the airpods, airpods pro or airpods max"
    ),
});

export const toolInputWithQty = z.object({
  model: z
    .enum(["airpods", "airpods pro", "airpods max"])
    .describe(
      "The model of airpods, either the airpods, airpods pro or airpods max"
    ),
  quantity: z.number().describe("The number of airpods they want to order"),
});

export async function erpGetTools() {
  return [
    zodFunction({
      name: "checkInventory",
      description:
        "Check the inventory of airpods, airpods pro or airpods max.",
      parameters: toolInput,
    }),
    zodFunction({
      name: "checkPrice",
      description:
        "Check the price of given model of airpods, airpods pro or airpods max.",
      parameters: toolInput,
    }),
    zodFunction({
      name: "placeOrder",
      description: "Places an order for a set of airpods.",
      parameters: toolInputWithQty,
    }),
  ];
}
