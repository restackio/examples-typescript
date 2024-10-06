import { log, sleep } from "@restackio/ai/function";
import { z } from "zod";
import { toolInput } from "./tools";

export type PriceInput = z.infer<typeof toolInput>;

export async function erpCheckPrice({ model }: PriceInput) {
  log.info("GPT -> called checkPrice function");
  sleep(500);
  if (model?.toLowerCase().includes("pro")) {
    return JSON.stringify({ price: 249 });
  } else if (model?.toLowerCase().includes("max")) {
    return JSON.stringify({ price: 549 });
  } else {
    return JSON.stringify({ price: 149 });
  }
}
