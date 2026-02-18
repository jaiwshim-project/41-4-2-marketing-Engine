import { createClient } from '@supabase/supabase-js';
import type { SmSequenceNode, DelayNodeConfig, EmailNodeConfig, ConditionNodeConfig, ActionNodeConfig } from './types';

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

/**
 * 시퀀스에서 다음 노드로 진행
 * 현재 노드에서 나가는 엣지를 찾아 다음 노드 처리
 */
export async function advanceEnrollment(
  enrollmentId: string,
  currentNodeId: string,
): Promise<void> {
  const supabase = getServiceClient();

  // 현재 노드에서 나가는 엣지 조회
  const { data: edges } = await supabase
    .from('sm_sequence_edges')
    .select('target_node_id, edge_label')
    .eq('source_node_id', currentNodeId);

  if (!edges?.length) {
    // 나가는 엣지 없음 = 시퀀스 완료
    await supabase
      .from('sm_enrollments')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', enrollmentId);
    return;
  }

  // 기본: 첫 번째 엣지의 타겟 노드로 이동
  const nextNodeId = edges[0].target_node_id;
  await processNode(supabase, enrollmentId, nextNodeId);
}

/**
 * 노드 타입에 따라 처리
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function processNode(
  supabase: any,
  enrollmentId: string,
  nodeId: string,
): Promise<void> {
  const { data: node } = await supabase
    .from('sm_sequence_nodes')
    .select('*')
    .eq('id', nodeId)
    .single();

  if (!node) return;

  const typedNode = node as SmSequenceNode;

  switch (typedNode.node_type) {
    case 'delay': {
      const config = typedNode.config as DelayNodeConfig;
      const msMap: Record<string, number> = { hours: 3600000, days: 86400000, weeks: 604800000 };
      const delayMs = (config.amount || 1) * (msMap[config.unit] || 86400000);
      const nextStepAt = new Date(Date.now() + delayMs).toISOString();

      await supabase
        .from('sm_enrollments')
        .update({ current_node_id: nodeId, next_step_at: nextStepAt })
        .eq('id', enrollmentId);
      break;
    }

    case 'email': {
      const config = typedNode.config as EmailNodeConfig;
      if (!config.content_id) break;

      // 등록 정보 조회
      const { data: enrollment } = await supabase
        .from('sm_enrollments')
        .select('subscriber_id, sequence_id')
        .eq('id', enrollmentId)
        .single();

      if (!enrollment) break;

      // 발송 큐에 추가 (즉시 발송)
      await supabase.from('sm_send_queue').insert({
        subscriber_id: enrollment.subscriber_id,
        content_id: config.content_id,
        sequence_id: enrollment.sequence_id,
        node_id: nodeId,
        enrollment_id: enrollmentId,
        scheduled_at: new Date().toISOString(),
        status: 'pending',
      });

      // 현재 노드 업데이트
      await supabase
        .from('sm_enrollments')
        .update({ current_node_id: nodeId })
        .eq('id', enrollmentId);
      break;
    }

    case 'condition': {
      const config = typedNode.config as ConditionNodeConfig;
      const { data: enrollment } = await supabase
        .from('sm_enrollments')
        .select('subscriber_id')
        .eq('id', enrollmentId)
        .single();

      if (!enrollment) break;

      let conditionMet = false;

      if (config.condition_type === 'score_gte') {
        const { data: sub } = await supabase
          .from('sm_subscribers')
          .select('engagement_score')
          .eq('id', enrollment.subscriber_id)
          .single();
        conditionMet = (sub?.engagement_score || 0) >= (config.threshold || 0);
      } else if (config.condition_type === 'opened' && config.content_id) {
        const { count } = await supabase
          .from('sm_events')
          .select('*', { count: 'exact', head: true })
          .eq('subscriber_id', enrollment.subscriber_id)
          .eq('content_id', config.content_id)
          .eq('event_type', 'OPEN');
        conditionMet = (count || 0) > 0;
      } else if (config.condition_type === 'clicked' && config.content_id) {
        const { count } = await supabase
          .from('sm_events')
          .select('*', { count: 'exact', head: true })
          .eq('subscriber_id', enrollment.subscriber_id)
          .eq('content_id', config.content_id)
          .eq('event_type', 'CLICK');
        conditionMet = (count || 0) > 0;
      } else if (config.condition_type === 'tag_contains' && config.tag) {
        const { data: sub } = await supabase
          .from('sm_subscribers')
          .select('tags')
          .eq('id', enrollment.subscriber_id)
          .single();
        conditionMet = (sub?.tags || []).includes(config.tag);
      }

      // 조건 결과에 따라 적절한 엣지 선택
      const { data: outEdges } = await supabase
        .from('sm_sequence_edges')
        .select('target_node_id, edge_label')
        .eq('source_node_id', nodeId);

      if (outEdges?.length) {
        const targetEdge = outEdges.find((e: { target_node_id: string; edge_label: string }) =>
          conditionMet ? e.edge_label === 'yes' : e.edge_label === 'no'
        ) || outEdges[0];

        await processNode(supabase, enrollmentId, targetEdge.target_node_id);
      }
      break;
    }

    case 'action': {
      const config = typedNode.config as ActionNodeConfig;
      const { data: enrollment } = await supabase
        .from('sm_enrollments')
        .select('subscriber_id')
        .eq('id', enrollmentId)
        .single();

      if (!enrollment) break;

      if (config.action_type === 'add_tag') {
        const { data: sub } = await supabase
          .from('sm_subscribers')
          .select('tags')
          .eq('id', enrollment.subscriber_id)
          .single();
        const newTags = [...new Set([...(sub?.tags || []), String(config.value)])];
        await supabase
          .from('sm_subscribers')
          .update({ tags: newTags })
          .eq('id', enrollment.subscriber_id);
      } else if (config.action_type === 'remove_tag') {
        const { data: sub } = await supabase
          .from('sm_subscribers')
          .select('tags')
          .eq('id', enrollment.subscriber_id)
          .single();
        const newTags = (sub?.tags || []).filter((t: string) => t !== String(config.value));
        await supabase
          .from('sm_subscribers')
          .update({ tags: newTags })
          .eq('id', enrollment.subscriber_id);
      } else if (config.action_type === 'update_score') {
        await supabase.rpc('sm_record_event', {
          p_subscriber_id: enrollment.subscriber_id,
          p_event_type: 'VISIT',
          p_metadata: { source: 'action_node', value: config.value },
        });
      }

      // 액션 후 다음 노드로 진행
      await supabase
        .from('sm_enrollments')
        .update({ current_node_id: nodeId })
        .eq('id', enrollmentId);
      await advanceEnrollment(enrollmentId, nodeId);
      break;
    }

    case 'trigger':
      // 트리거 노드는 시작점이므로 다음으로 진행
      await supabase
        .from('sm_enrollments')
        .update({ current_node_id: nodeId })
        .eq('id', enrollmentId);
      await advanceEnrollment(enrollmentId, nodeId);
      break;
  }
}

/**
 * 시퀀스에 구독자 등록 (시작 트리거 노드 찾아서 진행)
 */
export async function enrollSubscriber(
  subscriberId: string,
  sequenceId: string,
): Promise<string | null> {
  const supabase = getServiceClient();

  // 이미 등록되어 있는지 확인
  const { data: existing } = await supabase
    .from('sm_enrollments')
    .select('id')
    .eq('subscriber_id', subscriberId)
    .eq('sequence_id', sequenceId)
    .eq('status', 'active')
    .maybeSingle();

  if (existing) return existing.id;

  // 트리거 노드 찾기
  const { data: triggerNode } = await supabase
    .from('sm_sequence_nodes')
    .select('id')
    .eq('sequence_id', sequenceId)
    .eq('node_type', 'trigger')
    .limit(1)
    .single();

  if (!triggerNode) return null;

  // 등록 생성
  const { data: enrollment, error } = await supabase
    .from('sm_enrollments')
    .insert({
      subscriber_id: subscriberId,
      sequence_id: sequenceId,
      current_node_id: triggerNode.id,
      status: 'active',
    })
    .select()
    .single();

  if (error || !enrollment) return null;

  // 트리거 노드에서 시작
  await advanceEnrollment(enrollment.id, triggerNode.id);

  return enrollment.id;
}
