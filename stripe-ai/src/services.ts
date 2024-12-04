import { client } from './client';
import { createPaymentLink } from './functions';

async function services() {
  const workflowsPath = require.resolve('./workflows');
  try {
    await Promise.all([
      // Start service with current workflows and functions
      client.startService({
        workflowsPath,
        functions: { createPaymentLink },
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
