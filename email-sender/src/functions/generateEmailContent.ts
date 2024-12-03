import OpenAI from 'openai/index';
import { FunctionFailure } from '@restackio/ai/function';

type GenerateEmailContentInput = {
  emailContext: string;
};

export async function generateEmailContent({
  emailContext,
}: GenerateEmailContentInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw FunctionFailure.nonRetryable('OPENAI_API_KEY is not set');
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
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
      throw FunctionFailure.nonRetryable('Ai could not generate email content');
    }

    return text;
  } catch (error) {
    console.error('Error generating email content:', error);
    throw new Error('Failed to generate email content');
  }
}
