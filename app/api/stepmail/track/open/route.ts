import { NextRequest, NextResponse } from 'next/server';
import { verifyTrackingToken } from '@/lib/stepmail/tracking';
import { createClient } from '@supabase/supabase-js';

// 1x1 transparent GIF
const PIXEL_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

// GET /api/stepmail/track/open?token=xxx
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (token) {
    const payload = await verifyTrackingToken(token);
    if (payload) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // 이벤트 기록 (비동기, non-blocking)
      supabase.rpc('sm_record_event', {
        p_subscriber_id: payload.sub,
        p_event_type: 'OPEN',
        p_content_id: payload.cid || null,
        p_sequence_id: payload.sid || null,
        p_node_id: payload.nid || null,
        p_metadata: {},
      }).then(({ error }) => { if (error) console.error(error); });
    }
  }

  return new NextResponse(PIXEL_GIF, {
    status: 200,
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
      'Pragma': 'no-cache',
    },
  });
}
