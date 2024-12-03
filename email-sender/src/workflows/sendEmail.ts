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
  const text = await step<typeof functions>({}).generateEmailContent({
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
