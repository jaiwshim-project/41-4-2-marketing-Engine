import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// POST /api/stepmail/sequences/[id]/publish - 시퀀스 활성화/비활성화
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { action } = await request.json(); // 'activate' | 'pause'

  // 노드 최소 검증 (트리거 + 이메일 1개 이상)
  if (action === 'activate') {
    const { data: nodes } = await supabase
      .from('sm_sequence_nodes')
      .select('node_type')
      .eq('sequence_id', id);

    const hasTriger = nodes?.some(n => n.node_type === 'trigger');
    const hasEmail = nodes?.some(n => n.node_type === 'email');

    if (!hasTriger || !hasEmail) {
      return NextResponse.json(
        { error: '시퀀스에는 최소 트리거 노드 1개와 이메일 노드 1개가 필요합니다' },
        { status: 400 }
      );
    }
  }

  const newStatus = action === 'activate' ? 'active' : 'paused';

  const { data, error } = await supabase
    .from('sm_sequences')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}
