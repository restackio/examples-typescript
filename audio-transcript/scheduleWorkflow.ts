import { client } from './src/client';

import 'dotenv/config';

type TranscribeAndTranslateWorkflowInput = {
  filePath: string;
  targetLanguage: string;
};

async function scheduleWorkflow(input: TranscribeAndTranslateWorkflowInput) {
  try {
    const workflowId = `${Date.now()}-transcribeAndTranslateWorkflow`;
    await client.scheduleWorkflow({
      workflowName: 'transcribeAndTranslateWorkflow',
      workflowId,
      input,
    });

    console.log('Workflow scheduled successfully');

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error('Error scheduling workflow:', error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow({
  filePath: './test.mp3',
  targetLanguage: 'es',
});
