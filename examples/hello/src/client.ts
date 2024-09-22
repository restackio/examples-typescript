import Restack from "@restackio/restack-sdk-ts";

import "dotenv/config";

export const connectionOptions = {
  envId: process.env.RESTACK_ENGINE_ENV_ID!,
  apiKey: process.env.RESTACK_ENGINE_API_KEY!,
  address: process.env.RESTACK_ENGINE_API_ADDRESS!,
  temporalNamespace: process.env.RESTACK_ENGINE_TEMPORAL_NAMESPACE!,
};

export const client = new Restack(
  process.env.RESTACK_ENGINE_API_KEY ? connectionOptions : undefined
);
