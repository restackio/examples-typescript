import OpenAI from 'openai/index';
import { FunctionFailure } from '@restackio/ai/function';

type GenerateEmailContentInput = {
  emailContext: string;
  simulateFailure?: boolean;
};

let tries = 0;

export async function generateEmailContent({
  emailContext,
  simulateFailure = false,
}: GenerateEmailContentInput) {
  // this is just to simulate a failure and showcase how Restack will automatically retry this function when called from a workflow.
  // after it is successful, your workflow will continue with its next steps.
  if (simulateFailure && tries === 0) {
    tries += 1;
    throw FunctionFailure.retryable(
      'Intentional failure to showcase retry logic'
    );
  }
  if (!process.env.OPENAI_API_KEY) {
    throw FunctionFailure.nonRetryable('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content:
          'You are a helpful assistant that generates short emails based on the provided context.',
      },
      {
        role: 'user',
        content: `Generate a short email based on the following context: ${emailContext}`,
      },
    ],
    max_tokens: 150,
  });

  const text = response.choices[0].message.content;

  if (!text) {
    throw FunctionFailure.retryable(
      'Ai could not generate email content, retrying...'
    );
  }

  return text;
}
