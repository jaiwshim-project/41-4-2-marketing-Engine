import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/stepmail/contents/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { data, error } = await supabase
    .from('sm_contents')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (error) return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다' }, { status: 404 });

  // 블록도 조회
  const { data: blocks } = await supabase
    .from('sm_content_blocks')
    .select('*')
    .eq('content_id', id)
    .order('position_order');

  return NextResponse.json({ ...data, blocks: blocks || [] });
}

// PATCH /api/stepmail/contents/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const body = await request.json();
  const { blocks, ...contentData } = body;

  contentData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('sm_contents')
    .update(contentData)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 블록 업데이트 (전체 교체)
  if (blocks) {
    await supabase.from('sm_content_blocks').delete().eq('content_id', id);
    if (blocks.length > 0) {
      await supabase.from('sm_content_blocks').insert(
        blocks.map((b: { block_type: string; block_text: string; position_order: number }) => ({
          content_id: id,
          block_type: b.block_type,
          block_text: b.block_text,
          position_order: b.position_order,
        }))
      );
    }
  }

  return NextResponse.json(data);
}

// DELETE /api/stepmail/contents/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { error } = await supabase
    .from('sm_contents')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
