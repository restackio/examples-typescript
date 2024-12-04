import { log, step } from "@restackio/ai/workflow";

import * as functions from '../functions';

export async function createPaymentLinkWorkflow() {
  const result = await step<typeof functions>({}).createPaymentLink();

  log.info('Payment link created', { result });
}
