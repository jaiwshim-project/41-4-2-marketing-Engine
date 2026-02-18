import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// GET /api/stepmail/unsubscribe?sid=subscriber_id
export async function GET(request: NextRequest) {
  const subscriberId = request.nextUrl.searchParams.get('sid');

  if (!subscriberId) {
    return new NextResponse(unsubscribeHtml('잘못된 요청입니다.', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from('sm_subscribers')
    .update({
      is_unsubscribed: true,
      unsubscribed_at: new Date().toISOString(),
    })
    .eq('id', subscriberId);

  // 수신거부 이벤트 기록
  if (!error) {
    await supabase.rpc('sm_record_event', {
      p_subscriber_id: subscriberId,
      p_event_type: 'UNSUBSCRIBE',
      p_metadata: {},
    }).then(({ error: rpcErr }) => { if (rpcErr) console.error(rpcErr); });
  }

  return new NextResponse(
    unsubscribeHtml(
      error ? '처리 중 오류가 발생했습니다.' : '수신 거부가 완료되었습니다.',
      !error
    ),
    {
      status: 200,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    }
  );
}

function unsubscribeHtml(message: string, success: boolean): string {
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>수신 거부</title>
  <style>
    body { font-family: -apple-system, sans-serif; display: flex; justify-content: center; align-items: center; min-height: 100vh; margin: 0; background: #f4f4f4; }
    .card { background: white; padding: 48px; border-radius: 16px; text-align: center; max-width: 400px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .icon { font-size: 48px; margin-bottom: 16px; }
    h1 { font-size: 20px; color: #111; margin: 0 0 8px; }
    p { color: #666; font-size: 14px; margin: 0; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">${success ? '✓' : '!'}</div>
    <h1>${message}</h1>
    <p>${success ? '더 이상 이메일을 받지 않습니다.' : '다시 시도해 주세요.'}</p>
  </div>
</body>
</html>`;
}
