import { Resend } from 'resend';
import { renderEmailHtml } from './email-renderer';
import type { SmContent } from './types';

let resendClient: Resend | null = null;

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }
  return resendClient;
}

interface SendEmailOptions {
  to: string;
  toName?: string;
  subject: string;
  previewText?: string;
  bodyHtml: string;
  subscriberId: string;
  contentId: string;
  sequenceId?: string;
  nodeId?: string;
}

export async function sendEmail(opts: SendEmailOptions) {
  const resend = getResend();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.geo-aio.com';
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'noreply@geo-aio.com';
  const fromName = process.env.RESEND_FROM_NAME || 'GEOAIO 마케팅';

  const html = await renderEmailHtml({
    content: {
      subject_line: opts.subject,
      preview_text: opts.previewText,
      body_html: opts.bodyHtml,
    },
    subscriberId: opts.subscriberId,
    contentId: opts.contentId,
    sequenceId: opts.sequenceId,
    nodeId: opts.nodeId,
    senderName: fromName,
    unsubscribeUrl: `${baseUrl}/api/stepmail/unsubscribe?sid=${opts.subscriberId}`,
    baseUrl,
  });

  const result = await resend.emails.send({
    from: `${fromName} <${fromEmail}>`,
    to: opts.toName ? `${opts.toName} <${opts.to}>` : opts.to,
    subject: opts.subject,
    html,
  });

  if (result.error) {
    throw new Error(result.error.message);
  }

  return result.data!;
}

export async function sendContentEmail(
  content: SmContent,
  subscriberEmail: string,
  subscriberName: string | undefined,
  subscriberId: string,
  sequenceId?: string,
  nodeId?: string,
) {
  return sendEmail({
    to: subscriberEmail,
    toName: subscriberName,
    subject: content.subject_line,
    previewText: content.preview_text,
    bodyHtml: content.body_html || content.body_markdown || '',
    subscriberId,
    contentId: content.id,
    sequenceId,
    nodeId,
  });
}
