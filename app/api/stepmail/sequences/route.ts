import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { CreateSequenceRequest } from '@/lib/stepmail/types';

// GET /api/stepmail/sequences
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { data, error } = await supabase
    .from('sm_sequences')
    .select('*')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 각 시퀀스의 등록 수 조회
  const sequences = await Promise.all(
    (data || []).map(async (seq) => {
      const { count } = await supabase
        .from('sm_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', seq.id);
      return { ...seq, enrolled_count: count || 0 };
    })
  );

  return NextResponse.json({ sequences });
}

// POST /api/stepmail/sequences
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const body: CreateSequenceRequest = await request.json();

  if (!body.name) {
    return NextResponse.json({ error: '시퀀스 이름은 필수입니다' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('sm_sequences')
    .insert({
      owner_id: user.id,
      name: body.name,
      description: body.description,
      goal_type: body.goal_type || 'nurture',
      trigger_config: body.trigger_config || { type: 'manual' },
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 기본 트리거 노드 자동 생성
  await supabase.from('sm_sequence_nodes').insert({
    sequence_id: data.id,
    node_type: 'trigger',
    label: '시작',
    config: { trigger_type: body.trigger_config?.type || 'manual' },
    position_x: 250,
    position_y: 50,
  });

  return NextResponse.json(data, { status: 201 });
}
