import { StripeAgentToolkit } from '@stripe/agent-toolkit/ai-sdk';
import { openai } from '@ai-sdk/openai';
import { generateText } from 'ai';
import { FunctionFailure } from '@restackio/ai/function';

import 'dotenv/config';

export async function createPaymentLink() {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw FunctionFailure.nonRetryable('STRIPE_SECRET_KEY is not set');
  }

  if (!process.env.OPENAI_API_KEY) {
    throw FunctionFailure.nonRetryable('OPENAI_API_KEY is not set');
  }

  const stripeAgentToolkit = new StripeAgentToolkit({
    secretKey: process.env.STRIPE_SECRET_KEY!,
    configuration: {
      actions: {
        paymentLinks: {
          create: true,
        },
        products: {
          create: true,
        },
        prices: {
          create: true,
        },
      },
    },
  });

  const result = await generateText({
    model: openai('gpt-4o'),
    tools: {
      ...stripeAgentToolkit.getTools(),
    },
    maxSteps: 5,
    prompt: 'Create a payment link for a new product called \"AI-Generated-Product\" with a price of $100.',
  });

  return result.text;
}
