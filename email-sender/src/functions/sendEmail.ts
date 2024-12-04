import sgMail from '@sendgrid/mail';
import { FunctionFailure } from '@restackio/ai/function';

import { generateEmailContent } from './generateEmailContent';

import 'dotenv/config';

type EmailInput = {
  text: string;
  subject: string;
  to: string;
};

export async function sendEmail({ text, subject, to }: EmailInput) {
  const fromEmail = process.env.FROM_EMAIL;

  if (!fromEmail) {
    throw FunctionFailure.nonRetryable('FROM_EMAIL is not set');
  }

  if (!process.env.SENDGRID_API_KEY) {
    throw FunctionFailure.nonRetryable('SENDGRID_API_KEY is not set');
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const msg = {
    to,
    from: fromEmail,
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
  } catch (error) {
    throw FunctionFailure.nonRetryable('Failed to send email');
  }
}
