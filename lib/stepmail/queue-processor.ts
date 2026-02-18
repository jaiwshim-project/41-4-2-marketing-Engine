import { createClient } from '@supabase/supabase-js';
import { sendEmail } from './resend';
import { advanceEnrollment } from './state-machine';

const BATCH_SIZE = 50;

interface ProcessResult {
  processed: number;
  sent: number;
  failed: number;
  skipped: number;
}

export async function processQueue(): Promise<ProcessResult> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Step 1: 시간 감쇠 적용
  await supabase.rpc('sm_apply_score_decay');

  // Step 2: 대기 중인 enrollment 처리 (delay 노드 완료)
  await processDelayedEnrollments(supabase);

  // Step 3: 발송 큐에서 배치 가져오기
  const now = new Date().toISOString();

  const { data: batch, error: fetchError } = await supabase
    .from('sm_send_queue')
    .select(`
      *,
      sm_subscribers!inner(id, email, name, is_unsubscribed, owner_id),
      sm_contents!inner(id, subject_line, preview_text, body_html, body_markdown)
    `)
    .eq('status', 'pending')
    .lte('scheduled_at', now)
    .order('scheduled_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (fetchError || !batch?.length) {
    return { processed: 0, sent: 0, failed: 0, skipped: 0 };
  }

  // 배치 잠금 (processing 상태로 변경)
  const batchIds = batch.map(item => item.id);
  await supabase
    .from('sm_send_queue')
    .update({ status: 'processing' })
    .in('id', batchIds)
    .eq('status', 'pending');

  let sent = 0, failed = 0, skipped = 0;

  for (const item of batch) {
    const subscriber = item.sm_subscribers as { id: string; email: string; name: string; is_unsubscribed: boolean };
    const content = item.sm_contents as { id: string; subject_line: string; preview_text: string; body_html: string; body_markdown: string };

    // 수신거부 구독자 건너뛰기
    if (subscriber.is_unsubscribed) {
      await supabase.from('sm_send_queue').update({ status: 'skipped' }).eq('id', item.id);
      skipped++;
      continue;
    }

    try {
      const result = await sendEmail({
        to: subscriber.email,
        toName: subscriber.name,
        subject: content.subject_line,
        previewText: content.preview_text,
        bodyHtml: content.body_html || content.body_markdown || '',
        subscriberId: subscriber.id,
        contentId: content.id,
        sequenceId: item.sequence_id,
        nodeId: item.node_id,
      });

      await supabase
        .from('sm_send_queue')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString(),
          resend_message_id: result.id,
        })
        .eq('id', item.id);

      // 발송 후 다음 노드로 진행
      if (item.enrollment_id && item.node_id) {
        await advanceEnrollment(item.enrollment_id, item.node_id);
      }

      sent++;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      const newRetryCount = (item.retry_count || 0) + 1;
      const newStatus = newRetryCount >= 3 ? 'failed' : 'pending';

      await supabase
        .from('sm_send_queue')
        .update({
          status: newStatus,
          retry_count: newRetryCount,
          error_message: errorMessage,
          scheduled_at: newStatus === 'pending'
            ? new Date(Date.now() + Math.pow(2, newRetryCount) * 60000).toISOString()
            : item.scheduled_at,
        })
        .eq('id', item.id);

      failed++;
    }
  }

  return { processed: batch.length, sent, failed, skipped };
}

/**
 * delay 노드에서 대기 중이던 enrollment들을 처리
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processDelayedEnrollments(supabase: any): Promise<void> {
  const now = new Date().toISOString();

  const { data: readyEnrollments } = await supabase
    .from('sm_enrollments')
    .select('id, current_node_id')
    .eq('status', 'active')
    .not('next_step_at', 'is', null)
    .lte('next_step_at', now)
    .limit(100);

  if (!readyEnrollments?.length) return;

  for (const enrollment of readyEnrollments) {
    if (enrollment.current_node_id) {
      // next_step_at 초기화
      await supabase
        .from('sm_enrollments')
        .update({ next_step_at: null })
        .eq('id', enrollment.id);

      await advanceEnrollment(enrollment.id, enrollment.current_node_id);
    }
  }
}
