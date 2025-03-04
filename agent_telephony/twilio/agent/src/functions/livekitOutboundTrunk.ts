import { livekitSipClient } from '../utils/livekitSipClient';
import { 
  SIPOutboundTrunkInfo,
  SIPTransport
} from '@livekit/protocol';
import { FunctionFailure, log, functionInfo } from "@restackio/ai/function";

export const livekitOutboundTrunk = async (): Promise<SIPOutboundTrunkInfo> => {
  try {
   const name = functionInfo().workflowExecution.runId
   const address = process.env.LIVEKIT_SIP_ADDRESS
   const numbers = [process.env.TWILIO_PHONE_NUMBER ?? ""]
   const authUsername = process.env.TWILIO_TRUNK_AUTH_USERNAME
   const authPassword = process.env.TWILIO_TRUNK_AUTH_PASSWORD

   if (!address || !numbers || !authUsername || !authPassword) {
      throw FunctionFailure.nonRetryable("Missing required environment variables");
    }

    const client = livekitSipClient({});

    const trunkInfo = await client.createSipOutboundTrunk(name, address, numbers, {
      authUsername,
      authPassword,
      transport: SIPTransport.SIP_TRANSPORT_AUTO,
    });

    log.info('livekitOutboundTrunk created', trunkInfo);

    return trunkInfo
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error livekitOutboundTrunk: ${error}`);
  }
}