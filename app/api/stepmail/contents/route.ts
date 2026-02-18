import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { CreateContentRequest } from '@/lib/stepmail/types';

// GET /api/stepmail/contents
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const stage = searchParams.get('stage') || '';

  let query = supabase
    .from('sm_contents')
    .select('*', { count: 'exact' })
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  if (stage) query = query.eq('funnel_stage', stage);

  const from = (page - 1) * limit;
  query = query.range(from, from + limit - 1);

  const { data, error, count } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    contents: data || [],
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit),
  });
}

// POST /api/stepmail/contents
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const body: CreateContentRequest = await request.json();

  if (!body.title || !body.subject_line) {
    return NextResponse.json({ error: '제목과 이메일 제목은 필수입니다' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('sm_contents')
    .insert({
      owner_id: user.id,
      title: body.title,
      subject_line: body.subject_line,
      preview_text: body.preview_text,
      body_html: body.body_html,
      body_markdown: body.body_markdown,
      funnel_stage: body.funnel_stage,
      emotion_type: body.emotion_type,
      cta_strength: body.cta_strength || 0,
      tags: body.tags || [],
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
