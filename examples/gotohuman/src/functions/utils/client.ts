import { GotoHuman } from "gotohuman";

let instance: GotoHuman | null = null;

export const gotoHumanClient = ({
  apiKey = process.env.GOTOHUMAN_API_KEY,
}: {
  apiKey?: string;
} = {}): GotoHuman => {
  if (!apiKey) {
    throw new Error("API key is required to create gotoHuman client.");
  }

  if (!instance) {
    instance = new GotoHuman(apiKey);
  }
  return instance;
};