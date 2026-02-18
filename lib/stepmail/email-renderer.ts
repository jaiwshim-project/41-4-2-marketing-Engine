import { signTrackingToken } from './tracking';

interface RenderEmailOptions {
  content: {
    subject_line: string;
    preview_text?: string;
    body_html?: string;
    body_markdown?: string;
  };
  subscriberId: string;
  contentId: string;
  sequenceId?: string;
  nodeId?: string;
  senderName: string;
  unsubscribeUrl: string;
  baseUrl: string;
}

export async function renderEmailHtml(opts: RenderEmailOptions): Promise<string> {
  const trackingToken = await signTrackingToken({
    sub: opts.subscriberId,
    cid: opts.contentId,
    sid: opts.sequenceId,
    nid: opts.nodeId,
    evt: 'o',
  });

  const trackingPixelUrl = `${opts.baseUrl}/api/stepmail/track/open?token=${trackingToken}`;

  const bodyContent = opts.content.body_html || markdownToEmailHtml(opts.content.body_markdown || '');

  // 클릭 트래킹: 본문의 링크를 트래킹 URL로 감싸기
  const trackedBody = await wrapLinksWithTracking(bodyContent, {
    subscriberId: opts.subscriberId,
    contentId: opts.contentId,
    sequenceId: opts.sequenceId,
    nodeId: opts.nodeId,
    baseUrl: opts.baseUrl,
  });

  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="x-apple-disable-message-reformatting">
  <title>${opts.content.subject_line}</title>
  <style>
    body { margin: 0; padding: 0; background: #f4f4f4; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { padding: 32px 40px 0; }
    .content { padding: 24px 40px; color: #333; line-height: 1.7; font-size: 16px; }
    .content h1 { color: #111; font-size: 24px; margin-bottom: 16px; }
    .content h2 { color: #111; font-size: 20px; margin-bottom: 12px; }
    .content h3 { color: #111; font-size: 18px; margin-bottom: 10px; }
    .content a { color: #6366f1; }
    .content p { margin: 0 0 16px; }
    .content ul, .content ol { margin: 0 0 16px; padding-left: 24px; }
    .footer { padding: 24px 40px; background: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #888; text-align: center; }
    .cta-button { display: inline-block; background: #6366f1; color: white !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 16px 0; }
    @media (max-width: 600px) {
      .container { width: 100% !important; }
      .content, .header, .footer { padding-left: 20px !important; padding-right: 20px !important; }
    }
  </style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;">${opts.content.preview_text || ''}</div>
  <div class="container">
    <div class="header"></div>
    <div class="content">
      ${trackedBody}
    </div>
    <div class="footer">
      <p>${opts.senderName}에서 발송한 이메일입니다.</p>
      <p><a href="${opts.unsubscribeUrl}" style="color:#888;">수신 거부하기</a></p>
    </div>
  </div>
  <img src="${trackingPixelUrl}" width="1" height="1" style="display:none;width:1px;height:1px;" alt="" />
</body>
</html>`;
}

function markdownToEmailHtml(markdown: string): string {
  return markdown
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^([^<])/gm, '<p>$1')
    .replace(/([^>])$/gm, '$1</p>');
}

async function wrapLinksWithTracking(
  html: string,
  opts: { subscriberId: string; contentId: string; sequenceId?: string; nodeId?: string; baseUrl: string }
): Promise<string> {
  const linkRegex = /href="(https?:\/\/[^"]+)"/g;
  const replacements: { original: string; tracked: string }[] = [];

  let match;
  while ((match = linkRegex.exec(html)) !== null) {
    const originalUrl = match[1];
    // 수신거부 링크는 트래킹하지 않음
    if (originalUrl.includes('/unsubscribe')) continue;

    const token = await signTrackingToken({
      sub: opts.subscriberId,
      cid: opts.contentId,
      sid: opts.sequenceId,
      nid: opts.nodeId,
      evt: 'c',
    });

    const trackedUrl = `${opts.baseUrl}/api/stepmail/track/click?token=${token}&url=${encodeURIComponent(originalUrl)}`;
    replacements.push({ original: `href="${originalUrl}"`, tracked: `href="${trackedUrl}"` });
  }

  let result = html;
  for (const r of replacements) {
    result = result.replace(r.original, r.tracked);
  }
  return result;
}
