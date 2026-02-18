import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET /api/stepmail/contents/history-list
// GEOAIO history 테이블에서 콘텐츠 목록 조회
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const type = request.nextUrl.searchParams.get('type') || ''; // 'analysis' | 'generation' | ''
  const search = request.nextUrl.searchParams.get('search') || '';

  let query = supabase
    .from('history')
    .select('id, type, title, summary, date, category, target_keyword, created_at, generate_result, original_content')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (type) {
    query = query.eq('type', type);
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,target_keyword.ilike.%${search}%`);
  }

  const { data: items, error } = await query;

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 이미 임포트된 history_id 목록 조회
  const { data: imported } = await supabase
    .from('sm_contents')
    .select('source_history_id')
    .eq('owner_id', user.id)
    .not('source_history_id', 'is', null);

  const importedIds = new Set((imported || []).map(i => i.source_history_id));

  // 응답용 데이터 가공 (본문 미리보기 100자)
  const historyItems = (items || []).map(item => {
    let preview = '';
    if (item.type === 'generation' && item.generate_result) {
      preview = (item.generate_result as { content?: string }).content?.slice(0, 100) || '';
    } else if (item.original_content) {
      preview = item.original_content.slice(0, 100);
    }

    return {
      id: item.id,
      type: item.type,
      title: item.title,
      summary: item.summary,
      date: item.date,
      category: item.category,
      target_keyword: item.target_keyword,
      preview: preview + (preview.length >= 100 ? '...' : ''),
      already_imported: importedIds.has(item.id),
    };
  });

  return NextResponse.json({ items: historyItems });
}
