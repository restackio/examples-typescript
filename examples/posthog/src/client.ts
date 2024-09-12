import Restack from "@restackio/restack-sdk-ts";

import "dotenv/config";

export const connectionOptions = {
  stackId: process.env.RESTACK_STACK_ID!,
  apiKey: process.env.RESTACK_API_KEY!,
  address: process.env.RESTACK_API_ADDRESS!,
  temporalNamespace: process.env.RESTACK_TEMPORAL_NAMESPACE!,
};

export const client = new Restack(
  process.env.RESTACK_API_KEY ? connectionOptions : undefined
);
