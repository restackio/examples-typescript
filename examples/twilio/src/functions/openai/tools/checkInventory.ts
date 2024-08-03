import { log } from "@restackio/restack-sdk-ts/function";

async function checkInventory(functionArgs: { model: string }) {
  const model = functionArgs.model;
  log.info("GPT -> called checkInventory function");

  if (model?.toLowerCase().includes("pro")) {
    return JSON.stringify({ stock: 10 });
  } else if (model?.toLowerCase().includes("max")) {
    return JSON.stringify({ stock: 0 });
  } else {
    return JSON.stringify({ stock: 100 });
  }
}

export default checkInventory;
