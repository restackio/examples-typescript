import { step } from '@restackio/ai/workflow';

import * as functions from '../functions';

type TranscribeAndTranslateInput = {
  filePath: string;
  targetLanguage: string;
};

export async function transcribeAndTranslateWorkflow({ filePath, targetLanguage }: TranscribeAndTranslateInput) {
  const transcription = await step<typeof functions>({}).transcribeAudio({
    filePath,
  });

  const translation = await step<typeof functions>({}).translateText({
    text: transcription,
    targetLanguage,
  });

  return { transcription, translation };
}
