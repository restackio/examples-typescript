import { log } from "@restackio/restack-sdk-ts/function";

async function checkPrice(functionArgs: { model: string }) {
  const model = functionArgs.model;
  log.info("GPT -> called checkPrice function");
  if (model?.toLowerCase().includes("pro")) {
    return JSON.stringify({ price: 249 });
  } else if (model?.toLowerCase().includes("max")) {
    return JSON.stringify({ price: 549 });
  } else {
    return JSON.stringify({ price: 149 });
  }
}

export default checkPrice;
