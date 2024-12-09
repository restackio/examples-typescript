import { transcribeAudio, translateText } from './functions';
import { client } from './client';

async function services() {
  const workflowsPath = require.resolve('./workflows');

  try {
    await Promise.all([
      // Start service with current workflows and functions
      client.startService({
        workflowsPath,
        functions: { transcribeAudio, translateText },
      }),
    ]);

    console.log('Services running successfully.');
  } catch (e) {
    console.error('Failed to run services', e);
  }
}

services().catch((err) => {
  console.error('Error running services:', err);
});
