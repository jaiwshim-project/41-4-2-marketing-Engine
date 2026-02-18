import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { CreateSubscriberRequest } from '@/lib/stepmail/types';

// GET /api/stepmail/subscribers - 구독자 목록
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const search = searchParams.get('search') || '';
  const state = searchParams.get('state') || '';
  const tag = searchParams.get('tag') || '';

  let query = supabase
    .from('sm_subscribers')
    .select('*', { count: 'exact' })
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (search) {
    query = query.or(`email.ilike.%${search}%,name.ilike.%${search}%`);
  }
  if (state) {
    query = query.eq('current_state', state);
  }
  if (tag) {
    query = query.contains('tags', [tag]);
  }

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    subscribers: data || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// POST /api/stepmail/subscribers - 구독자 생성
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const body: CreateSubscriberRequest = await request.json();

  if (!body.email) {
    return NextResponse.json({ error: '이메일은 필수입니다' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('sm_subscribers')
    .insert({
      owner_id: user.id,
      email: body.email,
      name: body.name || null,
      source: body.source || 'landing_form',
      tags: body.tags || [],
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: '이미 등록된 이메일입니다' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}
