import Restack from "@restackio/restack-sdk-ts";

import "dotenv/config";

export const connectionOptions = {
  envId: process.env.RESTACK_ENGINE_ENV_ID!,
  address: process.env.RESTACK_ENGINE_ENV_ADDRESS!,
  apiKey: process.env.RESTACK_ENGINE_ENV_API_KEY!,
};

export const client = new Restack(
  process.env.RESTACK_ENGINE_ENV_API_KEY ? connectionOptions : undefined
);
