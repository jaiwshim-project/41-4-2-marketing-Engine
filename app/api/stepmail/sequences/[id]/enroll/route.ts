import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { enrollSubscriber } from '@/lib/stepmail/state-machine';

// POST /api/stepmail/sequences/[id]/enroll - 구독자 수동 등록
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { subscriber_ids } = await request.json();

  if (!subscriber_ids?.length) {
    return NextResponse.json({ error: '구독자 ID가 필요합니다' }, { status: 400 });
  }

  // 시퀀스 활성 상태 확인
  const { data: seq } = await supabase
    .from('sm_sequences')
    .select('status')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (!seq) return NextResponse.json({ error: '시퀀스를 찾을 수 없습니다' }, { status: 404 });
  if (seq.status !== 'active') {
    return NextResponse.json({ error: '시퀀스가 활성 상태가 아닙니다' }, { status: 400 });
  }

  const results: { subscriber_id: string; enrollment_id: string | null; success: boolean }[] = [];

  for (const subId of subscriber_ids) {
    const enrollmentId = await enrollSubscriber(subId, id);
    results.push({
      subscriber_id: subId,
      enrollment_id: enrollmentId,
      success: !!enrollmentId,
    });
  }

  return NextResponse.json({ results });
}
