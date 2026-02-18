import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { classifyContent } from '@/lib/stepmail/classifier';

// POST /api/stepmail/contents/classify
// 기존 콘텐츠에 AI 분류 적용
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { content_id } = await request.json();

  if (!content_id) {
    return NextResponse.json({ error: 'content_id는 필수입니다' }, { status: 400 });
  }

  const { data: content, error } = await supabase
    .from('sm_contents')
    .select('*')
    .eq('id', content_id)
    .eq('owner_id', user.id)
    .single();

  if (error || !content) {
    return NextResponse.json({ error: '콘텐츠를 찾을 수 없습니다' }, { status: 404 });
  }

  const bodyText = content.body_markdown || content.body_html || '';
  if (!bodyText) {
    return NextResponse.json({ error: '분류할 콘텐츠 본문이 없습니다' }, { status: 400 });
  }

  const classification = await classifyContent(content.title, bodyText);

  // 콘텐츠 업데이트
  await supabase
    .from('sm_contents')
    .update({
      funnel_stage: classification.funnel_stage,
      emotion_type: classification.emotion_type,
      cta_strength: classification.cta_strength,
      conversion_weight: classification.conversion_weight,
      updated_at: new Date().toISOString(),
    })
    .eq('id', content_id);

  // 블록 교체
  await supabase.from('sm_content_blocks').delete().eq('content_id', content_id);
  if (classification.blocks.length > 0) {
    await supabase.from('sm_content_blocks').insert(
      classification.blocks.map(b => ({
        content_id,
        block_type: b.block_type,
        block_text: b.block_text,
        position_order: b.position_order,
      }))
    );
  }

  return NextResponse.json({ classification });
}
