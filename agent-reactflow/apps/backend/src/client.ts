import Restack from "@restackio/ai";

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

export const apiAddress = process.env.RESTACK_ENGINE_API_ADDRESS!

export const connectionOptions = {
  engineId: process.env.RESTACK_ENGINE_ID!,
  address: process.env.RESTACK_ENGINE_ADDRESS!,
  apiKey: process.env.RESTACK_ENGINE_API_KEY!,
  apiAddress,
};

console.log('Debug Restack Client connectionOptions:', connectionOptions);

export const client = new Restack(
  process.env.RESTACK_ENGINE_API_KEY ? connectionOptions : undefined
);
