import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// POST /api/stepmail/subscribers/subscribe - 공개 구독 폼 엔드포인트 (인증 불필요)
export async function POST(request: NextRequest) {
  const body = await request.json();

  if (!body.email || !body.owner_id) {
    return NextResponse.json(
      { error: '이메일과 owner_id는 필수입니다' },
      { status: 400 }
    );
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) {
    return NextResponse.json({ error: '유효한 이메일 주소를 입력해주세요' }, { status: 400 });
  }

  // Service role client (RLS bypass)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from('sm_subscribers')
    .upsert(
      {
        owner_id: body.owner_id,
        email: body.email,
        name: body.name || null,
        source: 'landing_form',
        tags: body.tags || [],
        metadata: body.metadata || {},
      },
      { onConflict: 'owner_id,email' }
    )
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // CORS headers
  const response = NextResponse.json({ success: true, subscriber_id: data.id }, { status: 201 });
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  return response;
}

// OPTIONS for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
