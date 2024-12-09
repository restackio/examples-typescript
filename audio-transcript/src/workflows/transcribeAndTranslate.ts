import { step } from '@restackio/ai/workflow';

import * as functions from '../functions';

type TranscribeAndTranslateInput = {
  filePath: string;
};

export async function transcribeAndTranslateWorkflow({ filePath }: TranscribeAndTranslateInput) {
  const transcription = await step<typeof functions>({}).transcribeAudio({
    filePath,
  });

  const translation = await step<typeof functions>({}).translateText({
    text: transcription,
    targetLanguage: 'en',
  });

  return { transcription, translation };
}
