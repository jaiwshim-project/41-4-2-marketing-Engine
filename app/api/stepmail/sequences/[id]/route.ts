import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/stepmail/sequences/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { data, error } = await supabase
    .from('sm_sequences')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (error) return NextResponse.json({ error: '시퀀스를 찾을 수 없습니다' }, { status: 404 });

  // 노드, 엣지, 등록 수 조회
  const [nodesRes, edgesRes, enrollRes] = await Promise.all([
    supabase.from('sm_sequence_nodes').select('*').eq('sequence_id', id),
    supabase.from('sm_sequence_edges').select('*').eq('sequence_id', id),
    supabase.from('sm_enrollments').select('*', { count: 'exact', head: true }).eq('sequence_id', id),
  ]);

  return NextResponse.json({
    ...data,
    nodes: nodesRes.data || [],
    edges: edgesRes.data || [],
    enrolled_count: enrollRes.count || 0,
  });
}

// PATCH /api/stepmail/sequences/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const body = await request.json();
  body.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('sm_sequences')
    .update(body)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/stepmail/sequences/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { error } = await supabase
    .from('sm_sequences')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
