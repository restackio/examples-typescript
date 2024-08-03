import { log } from "@restackio/restack-sdk-ts/function";

async function placeOrder(functionArgs: { model: string; quantity: number }) {
  const { model, quantity } = functionArgs;
  log.info("GPT -> called placeOrder function");

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

export default placeOrder;
