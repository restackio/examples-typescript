import { client } from './src/client';

import 'dotenv/config';

type SendEmailWorkflowInput = {
  emailContext: string;
  subject: string;
  to: string;
};

async function scheduleWorkflowWithRetries(input: SendEmailWorkflowInput) {
  try {
    const workflowId = `${Date.now()}-sendEmailWorkflow`;
    await client.scheduleWorkflow({
      workflowName: 'sendEmailWorkflow',
      workflowId,
      input: {
        ...input,
        simulateFailure: true,
      },
    });

    console.log('Workflow scheduled successfully');

    process.exit(0); // Exit the process successfully
  } catch (error) {
    console.error('Error scheduling workflow:', error);
    process.exit(1); // Exit the process with an error code
  }
}

scheduleWorkflowWithRetries({
  emailContext:
    'This email should contain a greeting. And telling user we have launched a new AI feature with Restack workflows. Workflows now offer logging and automatic retries when one of its steps fails. Name of user is not provided. You can set as goodbye message on the email just say "Best regards" or something like that. No need to mention name of user or name of person sending the email.',
  subject: 'Hello from Restack',
  to: process.env.TO_EMAIL!,
});
