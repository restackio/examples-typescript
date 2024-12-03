import { log, step } from '@restackio/ai/workflow';

import * as functions from '../functions';

type SendEmailWorkflowInput = {
  emailContext: string;
  subject: string;
  to: string;
  simulateFailure?: boolean;
};

const emailRetryPolicy = {
  initialInterval: '10s', // after each failure, wait 10 seconds before retrying
  backoffCoefficient: 1, // no exponential backoff, meaning we wait the same amount of time between retries.
};

export async function sendEmailWorkflow({
  emailContext,
  subject,
  to,
  simulateFailure = false,
}: SendEmailWorkflowInput) {
  const text = await step<typeof functions>({
    retry: emailRetryPolicy,
  }).generateEmailContent({
    emailContext,
    simulateFailure,
  });

  log.info('Email content generated');

  await step<typeof functions>({}).sendEmail({
    emailContext: text,
    subject,
    to,
  });

  log.info('Email sent successfully');
}
