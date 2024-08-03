import twilio from "twilio";
import { FunctionFailure } from "@restackio/restack-sdk-ts/function";
import "dotenv/config";

interface Output {
  sid: string;
}

export async function TwilioCall(): Promise<Output> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const from = process.env.FROM_NUMBER;
  const to = process.env.YOUR_NUMBER;

  const client = twilio(accountSid, authToken);

  if (!accountSid || !authToken) {
    throw FunctionFailure.nonRetryable("Twilio credentials are missing");
  }

  try {
    if (to && from) {
      const { sid } = await client.calls.create({
        url: `https://${process.env.SERVER}/incoming`,
        to,
        from,
      });
      return { sid };
    } else {
      throw FunctionFailure.nonRetryable(`No number`);
    }
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error Twilio call create: ${error}`);
  }
}
