import { log, step } from '@restackio/ai/workflow';
import * as functions from '../functions';

type SendEmailWorkflowInput = {
  emailContext: string;
  subject: string;
  to: string;
};

export async function sendEmailWorkflow({
  emailContext,
  subject,
  to,
}: SendEmailWorkflowInput) {
  const text = await step<typeof functions>({
    startToCloseTimeout: '10s', // maximum time given for step to be completed
    retry: {
      initialInterval: '1m', // after each failure, wait 1 minute before retrying
      backoffCoefficient: 1, // no exponential backoff, meaning we wait the same amount of time between retries.
    },
  }).generateEmailContent({
    emailContext,
  });

  log.info('Email content generated');

  await step<typeof functions>({}).sendEmail({
    emailContext: text,
    subject,
    to,
  });

  log.info('Email sent successfully');
}
