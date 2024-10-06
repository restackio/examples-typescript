import { log, sleep } from "@restackio/ai/function";
import { z } from "zod";
import { toolInput } from "./tools";

export type InventoryInput = z.infer<typeof toolInput>;

export async function erpCheckInventory({ model }: InventoryInput) {
  log.info("GPT -> called checkInventory function");
  sleep(200);
  if (model?.toLowerCase().includes("pro")) {
    return JSON.stringify({ stock: 10 });
  } else if (model?.toLowerCase().includes("max")) {
    return JSON.stringify({ stock: 0 });
  } else {
    return JSON.stringify({ stock: 100 });
  }
}
