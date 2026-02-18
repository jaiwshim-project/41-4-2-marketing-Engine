import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { parseCsv } from '@/lib/stepmail/csv-parser';

// POST /api/stepmail/subscribers/import-csv
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  const { csv_text, default_tags } = await request.json();

  if (!csv_text) {
    return NextResponse.json({ error: 'CSV 데이터가 필요합니다' }, { status: 400 });
  }

  const parseResult = parseCsv(csv_text);

  if (parseResult.valid.length === 0) {
    return NextResponse.json({
      error: '유효한 데이터가 없습니다',
      invalid: parseResult.invalid,
    }, { status: 400 });
  }

  // 일괄 삽입 (중복 무시)
  const rows = parseResult.valid.map(row => ({
    owner_id: user.id,
    email: row.email,
    name: row.name || null,
    source: 'csv_upload' as const,
    tags: [
      ...(row.tags ? row.tags.split(',').map(t => t.trim()) : []),
      ...(default_tags || []),
    ],
    metadata: {},
  }));

  let imported = 0;
  let duplicates = 0;

  // 50개씩 배치 삽입
  for (let i = 0; i < rows.length; i += 50) {
    const batch = rows.slice(i, i + 50);
    const { data, error } = await supabase
      .from('sm_subscribers')
      .upsert(batch, { onConflict: 'owner_id,email', ignoreDuplicates: true })
      .select();

    if (!error && data) {
      imported += data.length;
      duplicates += batch.length - data.length;
    }
  }

  return NextResponse.json({
    total: parseResult.total,
    imported,
    duplicates,
    invalid: parseResult.invalid,
  });
}
