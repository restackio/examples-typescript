import { client } from './src/client';

import 'dotenv/config';

async function scheduleWorkflow() {
  try {
    const workflowId = `${Date.now()}-sendEmailWorkflow`;
    await client.scheduleWorkflow({
      workflowName: 'createPaymentLinkWorkflow',
      workflowId,
    });

    console.log('Workflow scheduled successfully');

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error('Error scheduling workflow:', error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflow();
