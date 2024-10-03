import { welcome, goodbye } from "../functions/functions";
import { log, step } from "@restackio/restack-sdk-ts/workflow";


export async function greetingWorkflow(name: String) {

  const welcomeMessage = await step().welcome('human');
  log.info(welcomeMessage);

  const goodbyeMessage = await step().goodbye('human');
  log.info(goodbyeMessage);

};

