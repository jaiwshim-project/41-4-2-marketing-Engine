import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { UpdateSubscriberRequest } from '@/lib/stepmail/types';

// GET /api/stepmail/subscribers/[id]
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { data, error } = await supabase
    .from('sm_subscribers')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single();

  if (error) return NextResponse.json({ error: '구독자를 찾을 수 없습니다' }, { status: 404 });

  // 이벤트 히스토리도 함께 조회
  const { data: events } = await supabase
    .from('sm_events')
    .select('*')
    .eq('subscriber_id', id)
    .order('created_at', { ascending: false })
    .limit(50);

  return NextResponse.json({ subscriber: data, events: events || [] });
}

// PATCH /api/stepmail/subscribers/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const body: UpdateSubscriberRequest = await request.json();

  const updateData: Record<string, unknown> = {};
  if (body.name !== undefined) updateData.name = body.name;
  if (body.tags !== undefined) updateData.tags = body.tags;
  if (body.metadata !== undefined) updateData.metadata = body.metadata;
  if (body.is_unsubscribed !== undefined) {
    updateData.is_unsubscribed = body.is_unsubscribed;
    if (body.is_unsubscribed) updateData.unsubscribed_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('sm_subscribers')
    .update(updateData)
    .eq('id', id)
    .eq('owner_id', user.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

// DELETE /api/stepmail/subscribers/[id]
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { error } = await supabase
    .from('sm_subscribers')
    .delete()
    .eq('id', id)
    .eq('owner_id', user.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
