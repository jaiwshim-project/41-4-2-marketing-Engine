import { NextRequest, NextResponse } from 'next/server';
import { verifyTrackingToken } from '@/lib/stepmail/tracking';
import { createClient } from '@supabase/supabase-js';

// GET /api/stepmail/track/click?token=xxx&url=encoded_url
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const redirectUrl = request.nextUrl.searchParams.get('url');

  if (token) {
    const payload = await verifyTrackingToken(token);
    if (payload) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      supabase.rpc('sm_record_event', {
        p_subscriber_id: payload.sub,
        p_event_type: 'CLICK',
        p_content_id: payload.cid || null,
        p_sequence_id: payload.sid || null,
        p_node_id: payload.nid || null,
        p_metadata: { url: redirectUrl || '' },
      }).then(({ error }) => { if (error) console.error(error); });
    }
  }

  if (redirectUrl) {
    return NextResponse.redirect(decodeURIComponent(redirectUrl));
  }

  return NextResponse.json({ error: 'Missing URL' }, { status: 400 });
}
