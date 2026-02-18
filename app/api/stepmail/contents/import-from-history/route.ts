import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { classifyContent } from '@/lib/stepmail/classifier';

// POST /api/stepmail/contents/import-from-history
// geo-aio의 history 테이블에서 콘텐츠를 가져와 스텝메일 콘텐츠로 변환
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { history_id, auto_classify } = await request.json();

  if (!history_id) {
    return NextResponse.json({ error: 'history_id는 필수입니다' }, { status: 400 });
  }

  // geo-aio history에서 콘텐츠 조회
  const { data: history, error: historyError } = await supabase
    .from('history')
    .select('*')
    .eq('id', history_id)
    .eq('user_id', user.id)
    .single();

  if (historyError || !history) {
    return NextResponse.json({ error: '히스토리를 찾을 수 없습니다' }, { status: 404 });
  }

  // 콘텐츠 추출
  let title = history.title || '제목 없음';
  let bodyMarkdown = '';

  if (history.type === 'generation' && history.generate_result) {
    const result = history.generate_result;
    title = result.title || title;
    bodyMarkdown = result.content || '';
  } else if (history.type === 'analysis' && history.original_content) {
    bodyMarkdown = history.original_content;
  }

  // 콘텐츠 생성 데이터
  const contentData: Record<string, unknown> = {
    owner_id: user.id,
    title,
    subject_line: title,
    body_markdown: bodyMarkdown,
    source_history_id: history_id,
    tags: history.target_keyword ? [history.target_keyword] : [],
  };

  // AI 자동 분류
  if (auto_classify && bodyMarkdown) {
    try {
      const classification = await classifyContent(title, bodyMarkdown);
      contentData.funnel_stage = classification.funnel_stage;
      contentData.emotion_type = classification.emotion_type;
      contentData.cta_strength = classification.cta_strength;
      contentData.conversion_weight = classification.conversion_weight;

      // sm_contents 삽입
      const { data: content, error } = await supabase
        .from('sm_contents')
        .insert(contentData)
        .select()
        .single();

      if (error) return NextResponse.json({ error: error.message }, { status: 500 });

      // 블록 삽입
      if (classification.blocks.length > 0) {
        await supabase.from('sm_content_blocks').insert(
          classification.blocks.map(b => ({
            content_id: content.id,
            block_type: b.block_type,
            block_text: b.block_text,
            position_order: b.position_order,
          }))
        );
      }

      return NextResponse.json({
        content,
        classification,
      }, { status: 201 });
    } catch (classifyError) {
      // 분류 실패 시 분류 없이 저장
      console.error('Content classification failed:', classifyError);
    }
  }

  // 분류 없이 저장
  const { data: content, error } = await supabase
    .from('sm_contents')
    .insert(contentData)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ content }, { status: 201 });
}
