import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { SaveFlowRequest } from '@/lib/stepmail/types';

// POST /api/stepmail/sequences/flow
// 노드 + 엣지 일괄 저장
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { sequence_id, nodes, edges }: SaveFlowRequest & { sequence_id: string } = await request.json();

  if (!sequence_id) {
    return NextResponse.json({ error: 'sequence_id는 필수입니다' }, { status: 400 });
  }

  // 시퀀스 소유권 확인
  const { data: seq } = await supabase
    .from('sm_sequences')
    .select('id')
    .eq('id', sequence_id)
    .eq('owner_id', user.id)
    .single();

  if (!seq) return NextResponse.json({ error: '시퀀스를 찾을 수 없습니다' }, { status: 404 });

  // 기존 노드/엣지 삭제
  await supabase.from('sm_sequence_edges').delete().eq('sequence_id', sequence_id);
  await supabase.from('sm_sequence_nodes').delete().eq('sequence_id', sequence_id);

  // 노드 삽입
  if (nodes.length > 0) {
    const { error: nodesError } = await supabase.from('sm_sequence_nodes').insert(
      nodes.map(n => ({
        id: n.id,
        sequence_id,
        node_type: n.type,
        label: n.data?.label || n.type,
        config: n.data?.config || {},
        position_x: n.position.x,
        position_y: n.position.y,
      }))
    );
    if (nodesError) return NextResponse.json({ error: nodesError.message }, { status: 500 });
  }

  // 엣지 삽입
  if (edges.length > 0) {
    const { error: edgesError } = await supabase.from('sm_sequence_edges').insert(
      edges.map(e => ({
        id: e.id,
        sequence_id,
        source_node_id: e.source,
        target_node_id: e.target,
        edge_label: e.label || null,
        condition: e.data || {},
      }))
    );
    if (edgesError) return NextResponse.json({ error: edgesError.message }, { status: 500 });
  }

  // 시퀀스 업데이트 시각
  await supabase
    .from('sm_sequences')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', sequence_id);

  return NextResponse.json({ success: true, nodes: nodes.length, edges: edges.length });
}
