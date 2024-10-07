import { log, sleep } from "@restackio/ai/function";
import { z } from "zod";
import { toolInputWithQty } from "./tools";

export type OrderInput = z.infer<typeof toolInputWithQty>;

export async function erpPlaceOrder({ model, quantity = 1 }: OrderInput) {
  log.info("GPT -> called placeOrder function");
  sleep(200);
  const orderNum = Math.floor(
    Math.random() * (9999999 - 1000000 + 1) + 1000000
  );

  if (model?.toLowerCase().includes("pro")) {
    return JSON.stringify({
      orderNumber: orderNum,
      price: Math.floor(quantity * 249 * 1.079),
    });
  } else if (model?.toLowerCase().includes("max")) {
    return JSON.stringify({
      orderNumber: orderNum,
      price: Math.floor(quantity * 549 * 1.079),
    });
  }
  return JSON.stringify({
    orderNumber: orderNum,
    price: Math.floor(quantity * 179 * 1.079),
  });
}
