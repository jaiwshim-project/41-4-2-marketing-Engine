import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import type { DashboardOverview, SubscriberState } from '@/lib/stepmail/types';

// GET /api/stepmail/metrics - 대시보드 메트릭
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: '인증 필요' }, { status: 401 });

  // 구독자 통계
  const { data: subscribers } = await supabase
    .from('sm_subscribers')
    .select('current_state, is_unsubscribed')
    .eq('owner_id', user.id);

  const stateDistribution: Record<SubscriberState, number> = {
    COLD: 0, WARM: 0, HOT: 0, DECISION: 0, CONVERTED: 0,
  };
  let totalSubscribers = 0;
  (subscribers || []).forEach(s => {
    if (!s.is_unsubscribed) {
      stateDistribution[s.current_state as SubscriberState]++;
      totalSubscribers++;
    }
  });

  // 활성 시퀀스 수
  const { count: activeSequences } = await supabase
    .from('sm_sequences')
    .select('*', { count: 'exact', head: true })
    .eq('owner_id', user.id)
    .eq('status', 'active');

  // 오늘 발송 수
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const { count: emailsSentToday } = await supabase
    .from('sm_send_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('sent_at', today.toISOString());

  // 최근 30일 오픈/클릭 통계
  const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();

  const { count: totalSent } = await supabase
    .from('sm_send_queue')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'sent')
    .gte('sent_at', thirtyDaysAgo);

  const { count: totalOpens } = await supabase
    .from('sm_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'OPEN')
    .gte('created_at', thirtyDaysAgo);

  const { count: totalClicks } = await supabase
    .from('sm_events')
    .select('*', { count: 'exact', head: true })
    .eq('event_type', 'CLICK')
    .gte('created_at', thirtyDaysAgo);

  const sentCount = totalSent || 1;

  const overview: DashboardOverview = {
    total_subscribers: totalSubscribers,
    active_sequences: activeSequences || 0,
    emails_sent_today: emailsSentToday || 0,
    avg_open_rate: (totalOpens || 0) / sentCount,
    avg_click_rate: (totalClicks || 0) / sentCount,
    state_distribution: stateDistribution,
  };

  // 시퀀스별 성과
  const { data: sequences } = await supabase
    .from('sm_sequences')
    .select('id, name, status')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false });

  const sequenceMetrics = await Promise.all(
    (sequences || []).map(async (seq) => {
      const { count: enrolled } = await supabase
        .from('sm_enrollments')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', seq.id);

      const { count: sends } = await supabase
        .from('sm_send_queue')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', seq.id)
        .eq('status', 'sent');

      const { count: opens } = await supabase
        .from('sm_events')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', seq.id)
        .eq('event_type', 'OPEN');

      const { count: clicks } = await supabase
        .from('sm_events')
        .select('*', { count: 'exact', head: true })
        .eq('sequence_id', seq.id)
        .eq('event_type', 'CLICK');

      const s = sends || 1;
      return {
        sequence_id: seq.id,
        sequence_name: seq.name,
        status: seq.status,
        total_enrolled: enrolled || 0,
        total_sends: sends || 0,
        open_rate: (opens || 0) / s,
        click_rate: (clicks || 0) / s,
        unsubscribe_rate: 0,
      };
    })
  );

  return NextResponse.json({ overview, sequenceMetrics });
}
