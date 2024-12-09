import fs from 'fs';
import OpenAI from 'openai';
import { FunctionFailure } from '@restackio/ai/function';

import 'dotenv/config';

type TranscribeAudioInput = {
  filePath: string;
};

export async function transcribeAudio({ filePath }: TranscribeAudioInput) {
  if (!process.env.OPENAI_API_KEY) {
    throw FunctionFailure.nonRetryable("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const audioFile = fs.createReadStream(filePath);
    const response = await openai.audio.transcriptions.create({
      model: "whisper-1",
      file: audioFile,
    });

    return response.text;
  } catch (error) {
    throw FunctionFailure.nonRetryable(`Error transcribing audio ${error}`);
  }
}
