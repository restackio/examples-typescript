import sgMail from '@sendgrid/mail';
import { FunctionFailure } from '@restackio/ai/function';
import { generateEmailContent } from './generateEmailContent';

import 'dotenv/config';

type EmailInput = {
  emailContext: string;
  subject: string;
  body: string;
  to: string;
};

export async function sendEmail({
  emailContext,
  subject,
  body,
  to,
}: EmailInput) {
  if (!process.env.SENDGRID_API_KEY) {
    throw FunctionFailure.nonRetryable('SENDGRID_API_KEY is not set');
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);

  const text = await generateEmailContent(emailContext);

  if (!text) {
    throw FunctionFailure.nonRetryable('Failed to generate email content');
  }

  const msg = {
    to,
    from: 'your-email@example.com',
    subject,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log(`Email sent to ${to} with subject ${subject}`);
  } catch (error) {
    console.error(`Error sending email to ${to}:`, error);
  }
}
