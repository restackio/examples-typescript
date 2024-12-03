import OpenAI from 'openai/index';
import { FunctionFailure } from '@restackio/ai/function';

export async function generateEmailContent(emailContext: string) {
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

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating email content:', error);
    throw new Error('Failed to generate email content');
  }
}
